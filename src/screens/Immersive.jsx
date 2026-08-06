import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, LayoutList, Volume2, VolumeX } from 'lucide-react';
import { applicableQuestions, flowContext, steps } from '../data/flow';
import { frailtyOf } from '../data/frailty';
import { FIELD_HINTS, FIELD_PLACEHOLDERS, FIELD_PROMPTS } from '../data/prompts';
import { buildPlan, caregivers } from '../data/carePlan';
import CloudBackground from '../components/immersive/CloudBackground';
import { createZenAudio } from '../lib/zenAudio';
import Button from '../components/Button';

const letterFor = (i) => String.fromCharCode(97 + i);

const EASE_OUT = [0.22, 0.61, 0.36, 1];
const EASE_IN = [0.55, 0.06, 0.68, 0.19];

// The screen orchestrates: its pieces arrive one after another, and on the way out
// they leave in reverse — the last thing you looked at is the first to go.
const screen = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.065, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.035, staggerDirection: -1 } },
};

const piece = {
  initial: { opacity: 0, y: 20, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { opacity: 0, y: -12, scale: 1.01, transition: { duration: 0.3, ease: EASE_IN } },
};

// a list is a piece that in turn staggers its own children
const list = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.055 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

function SingleQ({ question, onCommit }) {
  const [picked, setPicked] = useState(null);
  return (
    <motion.div className="imm-options" variants={list}>
      {question.options.map((opt, i) => (
        <motion.button
          key={opt.id}
          type="button"
          variants={piece}
          className={`imm-option${picked === opt.id ? ' is-selected' : ''}`}
          onClick={() => {
            if (picked) return;
            setPicked(opt.id);
            setTimeout(() => onCommit({ optionId: opt.id }), 500);
          }}
        >
          <span className="imm-letter">{letterFor(i)}</span>
          <span className="imm-option-text">
            <span className="imm-option-title">{opt.title}</span>
            {opt.description && <span className="imm-option-desc">{opt.description}</span>}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

function MultiQ({ question, onCommit }) {
  const [ids, setIds] = useState([]);
  const toggle = (id) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <>
      <motion.div className="imm-options" variants={list}>
        {question.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            type="button"
            variants={piece}
            className={`imm-option${ids.includes(opt.id) ? ' is-selected' : ''}`}
            onClick={() => toggle(opt.id)}
          >
            <span className="imm-letter">{letterFor(i)}</span>
            <span className="imm-option-text">
              <span className="imm-option-title">{opt.title}</span>
              {opt.description && <span className="imm-option-desc">{opt.description}</span>}
            </span>
          </motion.button>
        ))}
      </motion.div>
      <motion.div className="imm-actions" variants={piece}>
        <Button
          variant="primary"
          size="lg"
          disabled={!question.allowEmpty && ids.length === 0}
          onClick={() => onCommit({ optionIds: ids })}
        >
          {question.allowEmpty && ids.length === 0 ? 'None of these' : 'Continue'}
        </Button>
      </motion.div>
    </>
  );
}

// One field on its own screen — the reason the immersive variant reads as a
// conversation rather than a form.
function FieldQ({ item, initial, onCommit }) {
  const [value, setValue] = useState(initial || '');
  const ref = useRef(null);
  const optional = !!item.field.optional;
  const ready = optional || value.trim().length > 0;

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), 700);
    return () => clearTimeout(t);
  }, [item.id]);

  const commit = () => ready && onCommit(value.trim());

  return (
    <>
      <motion.label className="imm-single-field" variants={piece}>
        <input
          ref={ref}
          type="text"
          placeholder={FIELD_PLACEHOLDERS[item.field.id] || item.field.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
          }}
        />
      </motion.label>
      <motion.div className="imm-actions" variants={piece}>
        <Button variant="primary" size="lg" disabled={!ready} onClick={commit}>
          {optional && !value.trim() ? 'Skip' : 'Continue'}
        </Button>
      </motion.div>
    </>
  );
}

// The immersive questionnaire: one question at a time over slowly drifting clouds,
// with generative ambient audio, ending on the care plan without leaving the calm.
export default function Immersive({ user, answers, onAnswer, onPlan, onExit, onFinish }) {
  // Branching means the sequence itself depends on the answers so far, so it is
  // rebuilt as the frailty estimate firms up rather than fixed on mount.
  const frailty = frailtyOf(answers);
  const ctx = flowContext(answers, frailty?.level);

  const sequence = useMemo(() => {
    const seq = [];
    steps.forEach((step) => {
      const qs = applicableQuestions(step, ctx);
      if (!qs.length) return;
      seq.push({ type: 'intro', id: `intro-${step.id}`, text: step.intro });
      qs.forEach((q) => {
        if (q.type === 'inputs') {
          // each field becomes its own screen; the answer is only committed once
          // the last one is filled, so a half-finished question never counts as done
          q.fields.forEach((field, fi) => {
            seq.push({
              type: 'field',
              id: `${q.id}:${field.id}`,
              questionId: q.id,
              question: q,
              field,
              isLast: fi === q.fields.length - 1,
            });
          });
        } else {
          seq.push({ type: 'question', id: q.id, question: q });
        }
      });
      // the pivot of the client's flow: state the level before branching on it
      if (step.id === 'daily-life' && ctx.level) {
        seq.push({ type: 'frailty', id: 'frailty-reveal' });
      }
    });
    return seq;
  }, [ctx.band, ctx.level]);

  const isAskable = (s) => s.type === 'question' || s.type === 'field';
  const askable = useMemo(() => sequence.filter(isAskable), [sequence]);
  const isAnswered = (s) => !!answers[s.type === 'field' ? s.questionId : s.id];

  const [idx, setIdx] = useState(() => {
    const firstOpen = sequence.findIndex(
      (s) => (s.type === 'question' || s.type === 'field') && !answers[s.type === 'field' ? s.questionId : s.id]
    );
    if (firstOpen === -1) return -1;
    return sequence[firstOpen - 1]?.type === 'intro' ? firstOpen - 1 : firstOpen;
  });
  const [stage, setStage] = useState(idx === -1 ? 'breath' : 'asking');
  const [drafts, setDrafts] = useState({});
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = createZenAudio();
    audio.start(); // mounting is the result of a click, so autoplay is allowed
    audioRef.current = audio;
    return () => audio.stop();
  }, []);

  // a beat to breathe, then the plan — we stay inside the experience for it
  useEffect(() => {
    if (stage !== 'breath') return;
    const t = setTimeout(() => setStage('plan'), 2600);
    return () => clearTimeout(t);
  }, [stage]);

  const plan = useMemo(() => (stage === 'plan' ? buildPlan(answers) : null), [stage, answers]);

  // make sure the app has the plan before the user can be redirected to it
  useEffect(() => {
    if (plan) onPlan(plan);
  }, [plan, onPlan]);

  const advance = (from) => {
    let next = from + 1;
    while (next < sequence.length && isAskable(sequence[next]) && isAnswered(sequence[next])) {
      next += 1;
    }
    if (next >= sequence.length) setStage('breath');
    else setIdx(next);
  };

  const commitQuestion = (questionId, answer) => {
    onAnswer(questionId, answer);
    advance(idx);
  };

  const commitField = (item, value) => {
    const draft = { ...(drafts[item.questionId] || {}), [item.field.id]: value };
    setDrafts((d) => ({ ...d, [item.questionId]: draft }));
    if (item.isLast) onAnswer(item.questionId, { values: draft });
    advance(idx);
  };

  // branching rewrites the sequence, so an index can go stale — fall back rather
  // than render nothing
  const current =
    sequence[idx] ??
    sequence.find((s) => isAskable(s) && !isAnswered(s)) ??
    sequence[sequence.length - 1];
  // Counted by position in the flow, not by committed answers: a four-field question
  // commits once, so counting answers left the number frozen for four screens then
  // jumping by four.
  const position = current ? askable.findIndex((s) => s.id === current.id) : -1;
  const total = askable.length;
  const progress = stage === 'asking' ? Math.max(0, position) / total : 1;

  const firstName = user.name.split(' ')[0];
  const preview = caregivers.slice(0, 2);

  return (
    <motion.div
      className="immersive"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } }}
    >
      <CloudBackground />

      <div className="imm-chrome">
        <div
          className="imm-progress"
          role="progressbar"
          aria-valuenow={Math.max(0, position)}
          aria-valuemax={total}
        >
          <div className="imm-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="imm-ctls">
          <button
            type="button"
            className="imm-ctl"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              audioRef.current?.setMuted(next);
            }}
            aria-label={muted ? 'Unmute music' : 'Mute music'}
          >
            {muted ? <VolumeX size={15} strokeWidth={1.75} /> : <Volume2 size={15} strokeWidth={1.75} />}
          </button>
          <button type="button" className="imm-ctl" onClick={onExit} aria-label="Switch to classic view">
            <LayoutList size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="imm-stage">
        <AnimatePresence mode="wait">
          {stage === 'breath' && (
            <motion.div key="breath" className="imm-screen" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-intro-text" variants={piece}>
                That’s everything, {firstName}. Take a breath — I’m putting the plan together.
              </motion.p>
            </motion.div>
          )}

          {stage === 'plan' && plan && (
            <motion.div key="plan" className="imm-screen is-wide" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-count" variants={piece}>
                Your care plan
              </motion.p>
              <motion.h1 className="imm-title" variants={piece}>
                Here’s the plan for {plan.firstName}
              </motion.h1>
              <motion.p className="imm-plan-summary" variants={piece}>
                {plan.summary}
              </motion.p>

              <motion.div className="imm-facts" variants={list}>
                {plan.facts.map((f) => (
                  <motion.div className="imm-fact" key={f.label} variants={piece}>
                    <span className="imm-fact-label">{f.label}</span>
                    <span className="imm-fact-value">{f.value}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.p className="imm-plan-note" variants={piece}>
                {caregivers.length} caregivers matched — here are the two closest fits.
              </motion.p>
              <motion.div className="imm-options" variants={list}>
                {preview.map((c) => (
                  <motion.div className="imm-option is-static" key={c.id} variants={piece}>
                    <span className="imm-letter">{c.initials}</span>
                    <span className="imm-option-text">
                      <span className="imm-option-title">{c.name}</span>
                      <span className="imm-option-desc">
                        {c.match}% match · {c.years} yrs · {c.rate} · {c.area}
                      </span>
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div className="imm-actions" variants={piece}>
                <Button variant="primary" size="lg" onClick={onFinish}>
                  See the full plan <ArrowUpRight size={14} strokeWidth={2} />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {stage === 'asking' && current?.type === 'frailty' && frailty && (
            <motion.div key="frailty" className="imm-screen" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-count" variants={piece}>
                Frailty assessment
              </motion.p>
              <motion.h1 className="imm-title" variants={piece}>
                Level {frailty.level} — {frailty.label}
              </motion.h1>
              <motion.p className="imm-subtitle" variants={piece}>
                {frailty.blurb}
              </motion.p>
              <motion.div className="imm-cfs" variants={list}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                  <motion.span
                    key={l}
                    variants={piece}
                    className={`imm-cfs-step${l === frailty.level ? ' is-current' : ''}${
                      l < frailty.level ? ' is-passed' : ''
                    }`}
                  >
                    {l}
                  </motion.span>
                ))}
              </motion.div>
              <motion.div className="imm-actions" variants={piece}>
                <Button variant="primary" size="lg" onClick={() => advance(idx)}>
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          )}

          {stage === 'asking' && current?.type === 'intro' && (
            <motion.div key={current.id} className="imm-screen" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-intro-text" variants={piece}>
                {current.text}
              </motion.p>
              <motion.div className="imm-actions" variants={piece}>
                <Button variant="primary" size="lg" onClick={() => advance(idx)}>
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          )}

          {stage === 'asking' && current?.type === 'field' && (
            <motion.div key={current.id} className="imm-screen" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-count" variants={piece}>
                {position + 1} of {total}
              </motion.p>
              <motion.h1 className="imm-title" variants={piece}>
                {FIELD_PROMPTS[current.field.id] || current.field.label}
              </motion.h1>
              <motion.p className="imm-subtitle" variants={piece}>
                {FIELD_HINTS[current.field.id] || ''}
              </motion.p>
              <FieldQ
                item={current}
                initial={drafts[current.questionId]?.[current.field.id]}
                onCommit={(v) => commitField(current, v)}
              />
            </motion.div>
          )}

          {stage === 'asking' && current?.type === 'question' && (
            <motion.div key={current.id} className="imm-screen" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-count" variants={piece}>
                {position + 1} of {total}
              </motion.p>
              <motion.h1 className="imm-title" variants={piece}>
                {current.question.title}
              </motion.h1>
              <motion.p className="imm-subtitle" variants={piece}>
                {current.question.subtitle}
              </motion.p>
              {current.question.type === 'single' && (
                <SingleQ question={current.question} onCommit={(a) => commitQuestion(current.id, a)} />
              )}
              {current.question.type === 'multi' && (
                <MultiQ question={current.question} onCommit={(a) => commitQuestion(current.id, a)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
