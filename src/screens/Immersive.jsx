import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, LayoutList, Volume2, VolumeX } from 'lucide-react';
import { steps } from '../data/flow';
import { FIELD_HINTS, FIELD_PLACEHOLDERS, FIELD_PROMPTS } from '../data/prompts';
import { buildPlan, caregivers } from '../data/carePlan';
import CloudBackground from '../components/immersive/CloudBackground';
import { createZenAudio } from '../lib/zenAudio';
import Button from '../components/Button';

const letterFor = (i) => String.fromCharCode(97 + i);

// Long, soft cross-fades — the pacing is the point of this variant.
const screenMotion = {
  initial: { opacity: 0, scale: 0.975, y: 18 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } },
  exit: { opacity: 0, scale: 1.015, y: -14, transition: { duration: 0.45, ease: [0.55, 0.06, 0.68, 0.19] } },
};

function SingleQ({ question, onCommit }) {
  const [picked, setPicked] = useState(null);
  return (
    <div className="imm-options">
      {question.options.map((opt, i) => (
        <button
          key={opt.id}
          type="button"
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
        </button>
      ))}
    </div>
  );
}

function MultiQ({ question, onCommit }) {
  const [ids, setIds] = useState([]);
  const toggle = (id) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <>
      <div className="imm-options">
        {question.options.map((opt, i) => (
          <button
            key={opt.id}
            type="button"
            className={`imm-option${ids.includes(opt.id) ? ' is-selected' : ''}`}
            onClick={() => toggle(opt.id)}
          >
            <span className="imm-letter">{letterFor(i)}</span>
            <span className="imm-option-text">
              <span className="imm-option-title">{opt.title}</span>
              {opt.description && <span className="imm-option-desc">{opt.description}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="imm-actions">
        <Button variant="primary" size="lg" disabled={ids.length === 0} onClick={() => onCommit({ optionIds: ids })}>
          Continue
        </Button>
      </div>
    </>
  );
}

// One field on its own screen — the reason the immersive variant reads as a
// conversation rather than a form.
function FieldQ({ screen, initial, onCommit }) {
  const [value, setValue] = useState(initial || '');
  const ref = useRef(null);
  const optional = !!screen.field.optional;
  const ready = optional || value.trim().length > 0;

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), 700);
    return () => clearTimeout(t);
  }, [screen.id]);

  const commit = () => ready && onCommit(value.trim());

  return (
    <>
      <label className="imm-single-field">
        <input
          ref={ref}
          type="text"
          placeholder={FIELD_PLACEHOLDERS[screen.field.id] || screen.field.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
          }}
        />
      </label>
      <div className="imm-actions">
        <Button variant="primary" size="lg" disabled={!ready} onClick={commit}>
          {optional && !value.trim() ? 'Skip' : 'Continue'}
        </Button>
      </div>
    </>
  );
}

// The immersive questionnaire: one question at a time over slowly drifting clouds,
// with generative ambient audio, ending on the care plan without leaving the calm.
export default function Immersive({ user, answers, onAnswer, onPlan, onExit, onFinish }) {
  const sequence = useMemo(() => {
    const seq = [];
    steps.forEach((step) => {
      seq.push({ type: 'intro', id: `intro-${step.id}`, text: step.intro });
      step.questions.forEach((q) => {
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
    });
    return seq;
  }, []);

  const askable = useMemo(() => sequence.filter((s) => s.type !== 'intro'), [sequence]);
  const isAnswered = (s) => !!answers[s.type === 'field' ? s.questionId : s.id];

  const [idx, setIdx] = useState(() => {
    const firstOpen = sequence.findIndex((s) => s.type !== 'intro' && !answers[s.type === 'field' ? s.questionId : s.id]);
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

  const plan = useMemo(
    () => (stage === 'plan' ? buildPlan(answers) : null),
    [stage, answers]
  );

  // make sure the app has the plan before the user can be redirected to it
  useEffect(() => {
    if (plan) onPlan(plan);
  }, [plan, onPlan]);

  const advance = (from) => {
    let next = from + 1;
    while (next < sequence.length && sequence[next].type !== 'intro' && isAnswered(sequence[next])) {
      next += 1;
    }
    if (next >= sequence.length) setStage('breath');
    else setIdx(next);
  };

  const commitQuestion = (questionId, answer) => {
    onAnswer(questionId, answer);
    advance(idx);
  };

  const commitField = (screen, value) => {
    const draft = { ...(drafts[screen.questionId] || {}), [screen.field.id]: value };
    setDrafts((d) => ({ ...d, [screen.questionId]: draft }));
    if (screen.isLast) onAnswer(screen.questionId, { values: draft });
    advance(idx);
  };

  const answeredCount = askable.filter(isAnswered).length;
  const total = askable.length;
  const screen = sequence[idx];
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
        <div className="imm-progress" role="progressbar" aria-valuenow={answeredCount} aria-valuemax={total}>
          <div
            className="imm-progress-fill"
            style={{ width: `${stage === 'asking' ? (answeredCount / total) * 100 : 100}%` }}
          />
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
            <motion.div key="breath" className="imm-screen" {...screenMotion}>
              <p className="imm-intro-text">
                That’s everything, {firstName}. Take a breath — I’m putting the plan together.
              </p>
            </motion.div>
          )}

          {stage === 'plan' && plan && (
            <motion.div key="plan" className="imm-screen is-wide" {...screenMotion}>
              <p className="imm-count">Your care plan</p>
              <h1 className="imm-title">Here’s the plan for {plan.firstName}</h1>
              <p className="imm-plan-summary">{plan.summary}</p>

              <div className="imm-facts">
                {plan.facts.map((f) => (
                  <div className="imm-fact" key={f.label}>
                    <span className="imm-fact-label">{f.label}</span>
                    <span className="imm-fact-value">{f.value}</span>
                  </div>
                ))}
              </div>

              <p className="imm-plan-note">
                {caregivers.length} caregivers matched — here are the two closest fits.
              </p>
              <div className="imm-options">
                {preview.map((c) => (
                  <div className="imm-option is-static" key={c.id}>
                    <span className="imm-letter">{c.initials}</span>
                    <span className="imm-option-text">
                      <span className="imm-option-title">{c.name}</span>
                      <span className="imm-option-desc">
                        {c.match}% match · {c.years} yrs · {c.rate} · {c.area}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="imm-actions">
                <Button variant="primary" size="lg" onClick={onFinish}>
                  See the full plan <ArrowUpRight size={14} strokeWidth={2} />
                </Button>
              </div>
            </motion.div>
          )}

          {stage === 'asking' && screen?.type === 'intro' && (
            <motion.div key={screen.id} className="imm-screen" {...screenMotion}>
              <p className="imm-intro-text">{screen.text}</p>
              <div className="imm-actions">
                <Button variant="primary" size="lg" onClick={() => advance(idx)}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {stage === 'asking' && screen?.type === 'field' && (
            <motion.div key={screen.id} className="imm-screen" {...screenMotion}>
              <p className="imm-count">
                {answeredCount + 1} of {total}
              </p>
              <h1 className="imm-title">{FIELD_PROMPTS[screen.field.id] || screen.field.label}</h1>
              <p className="imm-subtitle">{FIELD_HINTS[screen.field.id] || ''}</p>
              <FieldQ
                screen={screen}
                initial={drafts[screen.questionId]?.[screen.field.id]}
                onCommit={(v) => commitField(screen, v)}
              />
            </motion.div>
          )}

          {stage === 'asking' && screen?.type === 'question' && (
            <motion.div key={screen.id} className="imm-screen" {...screenMotion}>
              <p className="imm-count">
                {answeredCount + 1} of {total}
              </p>
              <h1 className="imm-title">{screen.question.title}</h1>
              <p className="imm-subtitle">{screen.question.subtitle}</p>
              {screen.question.type === 'single' && (
                <SingleQ question={screen.question} onCommit={(a) => commitQuestion(screen.id, a)} />
              )}
              {screen.question.type === 'multi' && (
                <MultiQ question={screen.question} onCommit={(a) => commitQuestion(screen.id, a)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
