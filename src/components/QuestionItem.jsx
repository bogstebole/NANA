import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Asterisk, Pencil } from 'lucide-react';
import NumberIndicator from './NumberIndicator';
import SelectInput from './SelectInput';
import SelectCard from './SelectCard';
import Chip from './Chip';
import Button from './Button';

const letterFor = (i) => String.fromCharCode(97 + i);

const SPRING = { type: 'spring', stiffness: 260, damping: 30 };

function answerChips(question, answer) {
  if (!answer) return [];
  if (question.type === 'inputs') {
    const values = question.fields.map((f) => answer.values?.[f.id]).filter(Boolean);
    if (values.length <= 2) return values;
    return [...values.slice(0, 2), `+${values.length - 2}`];
  }
  if (question.type === 'single') {
    const opt = question.options.find((o) => o.id === answer.optionId);
    return opt ? [opt.title] : [];
  }
  const opts = question.options.filter((o) => answer.optionIds?.includes(o.id));
  if (opts.length > 1 && opts.every((o) => o.short)) {
    return [opts.map((o) => o.short).join(', ')];
  }
  if (opts.length <= 2) return opts.map((o) => o.title);
  return [...opts.slice(0, 2).map((o) => o.title), `+${opts.length - 2}`];
}

function ActiveBody({ question, answer, onCommit }) {
  const [draftValues, setDraftValues] = useState(() => ({ ...(answer?.values || {}) }));
  const [draftIds, setDraftIds] = useState(() => [...(answer?.optionIds || [])]);
  const [pickedId, setPickedId] = useState(answer?.optionId ?? null);
  const firstInputRef = useRef(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (question.type === 'inputs') {
      const t = setTimeout(() => firstInputRef.current?.focus({ preventScroll: true }), 380);
      return () => clearTimeout(t);
    }
  }, [question.type]);

  const inputsValid = useMemo(
    () =>
      question.type !== 'inputs' ||
      question.fields.every((f) => f.optional || (draftValues[f.id] || '').trim()),
    [question, draftValues]
  );

  if (question.type === 'inputs') {
    const commit = () => inputsValid && onCommit({ values: draftValues });
    return (
      <>
        <div className="selection-container">
          {question.fields.map((field, i) => (
            <SelectInput
              key={field.id}
              letter={letterFor(i)}
              label={field.label}
              placeholder={field.placeholder}
              value={draftValues[field.id] || ''}
              onChange={(v) => setDraftValues((d) => ({ ...d, [field.id]: v }))}
              inputRef={i === 0 ? firstInputRef : (inputRefs.current[i] ||= { current: null })}
              onEnter={() => {
                const next = inputRefs.current[i + 1];
                if (next?.current) next.current.focus();
                else commit();
              }}
            />
          ))}
        </div>
        <div className="card-footer">
          <Button variant="secondary" disabled={!inputsValid} onClick={commit}>
            Next
          </Button>
        </div>
      </>
    );
  }

  if (question.type === 'single') {
    return (
      <div className="selection-container">
        {question.options.map((opt, i) => (
          <SelectCard
            key={opt.id}
            letter={letterFor(i)}
            title={opt.title}
            description={opt.description}
            selected={pickedId === opt.id}
            onClick={() => {
              setPickedId(opt.id);
              setTimeout(() => onCommit({ optionId: opt.id }), 300);
            }}
          />
        ))}
      </div>
    );
  }

  const toggle = (id) =>
    setDraftIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  return (
    <>
      <div className="selection-container">
        {question.options.map((opt, i) => (
          <SelectCard
            key={opt.id}
            letter={letterFor(i)}
            title={opt.title}
            description={opt.description}
            selected={draftIds.includes(opt.id)}
            onClick={() => toggle(opt.id)}
          />
        ))}
      </div>
      <div className="card-footer">
        <Button
          variant="secondary"
          disabled={draftIds.length === 0}
          onClick={() => onCommit({ optionIds: draftIds })}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export default function QuestionItem({
  question,
  number,
  state,
  answer,
  onCommit,
  onEdit,
  isActive,
  readOnly,
}) {
  const isCard = state !== 'upcoming';

  let className;
  let content;
  if (state === 'active') {
    className = 'active-card';
    content = (
      <>
        <div className="card-header">
          <NumberIndicator selected>{number}</NumberIndicator>
          <div className="header-content">
            <p className="q-title">{question.title}</p>
            <p className="q-subtitle">{question.subtitle}</p>
          </div>
        </div>
        <ActiveBody question={question} answer={answer} onCommit={onCommit} />
      </>
    );
  } else if (state === 'collapsed') {
    className = 'collapsed-card';
    content = (
      <>
        <div className="question-label">
          <NumberIndicator onWhite>{number}</NumberIndicator>
          <p>{question.shortTitle}</p>
        </div>
        <div className="answer-action">
          {answerChips(question, answer).map((chip, i) => (
            <Chip key={`${chip}-${i}`}>{chip}</Chip>
          ))}
          {!readOnly && (
            <Button
              variant="secondary"
              iconOnly
              aria-label="Edit answer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil size={14} strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </>
    );
  } else {
    className = 'upcoming-row';
    content = (
      <>
        <Asterisk size={14} strokeWidth={1.75} className="star" />
        <span className="label">{question.shortTitle}</span>
      </>
    );
  }

  return (
    <motion.div
      layout
      data-active={isActive || undefined}
      className={`question-item ${isCard ? 'is-card' : 'is-upcoming'}`}
      style={{ borderRadius: 16 }}
      transition={{ layout: SPRING }}
    >
      {/* The wrapper above resizes via FLIP, which scales everything inside it.
          layout="position" on the content makes Framer counter-scale it, so text
          and controls keep their real size instead of stretching. popLayout takes
          the outgoing content out of flow so it never gets squashed on the way out. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={state}
          layout="position"
          className={`${className}${readOnly ? ' is-static' : ''}`}
          onClick={state === 'collapsed' && !readOnly ? onEdit : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.12 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
