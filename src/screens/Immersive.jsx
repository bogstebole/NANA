import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutList, Volume2, VolumeX } from 'lucide-react';
import { questions, steps } from '../data/flow';
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

function InputsQ({ question, onCommit }) {
  const [values, setValues] = useState({});
  const refs = useRef([]);
  const valid = question.fields.every((f) => f.optional || (values[f.id] || '').trim());
  const commit = () => valid && onCommit({ values });

  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus({ preventScroll: true }), 750);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="imm-options">
        {question.fields.map((field, i) => (
          <label className="imm-field" key={field.id}>
            <span className="imm-field-label">{field.label}</span>
            <input
              ref={(el) => (refs.current[i] = el)}
              type="text"
              placeholder={field.placeholder}
              value={values[field.id] || ''}
              onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const next = refs.current[i + 1];
                if (next) next.focus();
                else commit();
              }}
            />
          </label>
        ))}
      </div>
      <div className="imm-actions">
        <Button variant="primary" size="lg" disabled={!valid} onClick={commit}>
          Continue
        </Button>
      </div>
    </>
  );
}

// The immersive questionnaire: one question at a time over slowly drifting
// clouds, with generative ambient audio. Writes into the same answers state as
// the classic chat, so the two variants stay interchangeable mid-flow.
export default function Immersive({ user, answers, onAnswer, onExit }) {
  // intro screens re-create the assistant's voice between sections
  const sequence = useMemo(() => {
    const seq = [];
    steps.forEach((step) => {
      seq.push({ type: 'intro', id: `intro-${step.id}`, text: step.intro });
      step.questions.forEach((q) => seq.push({ type: 'question', id: q.id, question: q }));
    });
    return seq;
  }, []);

  const [idx, setIdx] = useState(() => {
    const firstOpen = sequence.findIndex((s) => s.type === 'question' && !answers[s.id]);
    if (firstOpen === -1) return -1; // nothing left to ask
    // open with the section's intro when its first question is still unanswered
    return sequence[firstOpen - 1]?.type === 'intro' ? firstOpen - 1 : firstOpen;
  });
  const [done, setDone] = useState(idx === -1);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = createZenAudio();
    audio.start(); // mounting is the result of a click, so autoplay is allowed
    audioRef.current = audio;
    return () => audio.stop();
  }, []);

  // the closing screen breathes for a moment, then hands back to the chat
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onExit, 3200);
    return () => clearTimeout(t);
  }, [done, onExit]);

  const advance = () => {
    let next = idx + 1;
    // skip anything already answered in the classic variant
    while (next < sequence.length && sequence[next].type === 'question' && answers[sequence[next].id]) {
      next += 1;
    }
    if (next >= sequence.length) setDone(true);
    else setIdx(next);
  };

  const commit = (questionId, answer) => {
    onAnswer(questionId, answer);
    advance();
  };

  const total = questions.length;
  const answered = questions.filter((q) => answers[q.id]).length;
  const screen = sequence[idx];
  const firstName = user.name.split(' ')[0];

  return (
    <motion.div
      className="immersive"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } }}
    >
      <CloudBackground />

      <div className="imm-chrome">
        <div className="imm-progress" role="progressbar" aria-valuenow={answered} aria-valuemax={total}>
          <div className="imm-progress-fill" style={{ width: `${(answered / total) * 100}%` }} />
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
          {done ? (
            <motion.div key="done" className="imm-screen" {...screenMotion}>
              <p className="imm-intro-text">
                That’s everything, {firstName}. Take a breath — I’m putting {answers['basic-info']?.values?.name?.split(' ')[0] || 'your'} care plan together now.
              </p>
            </motion.div>
          ) : screen.type === 'intro' ? (
            <motion.div key={screen.id} className="imm-screen" {...screenMotion}>
              <p className="imm-intro-text">{screen.text}</p>
              <div className="imm-actions">
                <Button variant="primary" size="lg" onClick={advance}>
                  Continue
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key={screen.id} className="imm-screen" {...screenMotion}>
              <p className="imm-count">
                {answered + 1} of {total}
              </p>
              <h1 className="imm-title">{screen.question.title}</h1>
              <p className="imm-subtitle">{screen.question.subtitle}</p>
              {screen.question.type === 'single' && (
                <SingleQ question={screen.question} onCommit={(a) => commit(screen.id, a)} />
              )}
              {screen.question.type === 'multi' && (
                <MultiQ question={screen.question} onCommit={(a) => commit(screen.id, a)} />
              )}
              {screen.question.type === 'inputs' && (
                <InputsQ question={screen.question} onCommit={(a) => commit(screen.id, a)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
