import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import QuestionItem from './QuestionItem';
import Button from './Button';

// A finished section keeps its first row readable and cuts into the second, so
// there is no dead grey space between the fade and the toggle.
const COLLAPSED_HEIGHT = 96;
const FADE_HEIGHT = 52;

// Fold from three rows up, so every section behaves the same way.
export const FOLDABLE_FROM = 3;

// One step of the questionnaire — the grey card holding its questions. Folds down
// to a summary once the conversation has moved past it.
export default function QuestionSection({ step, answers, activeIndex, collapsible, onCommit, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = collapsible && !expanded;

  return (
    <LayoutGroup id={step.id}>
      <motion.div layout className="workflow-card" style={{ borderRadius: 32 }}>
        <div className="answers-wrap">
          <motion.div
            className="answers"
            animate={collapsible ? { height: truncated ? COLLAPSED_HEIGHT : 'auto' } : {}}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          >
            {step.questions.map((q, i) => (
              <QuestionItem
                key={q.id}
                question={q}
                number={i + 1}
                state={i === activeIndex ? 'active' : answers[q.id] ? 'collapsed' : 'upcoming'}
                isActive={i === activeIndex}
                answer={answers[q.id]}
                onCommit={(a) => onCommit(q.id, a)}
                onEdit={() => onEdit(i)}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {truncated && (
              <motion.div
                key="fade"
                className="answers-fade"
                style={{ height: FADE_HEIGHT }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </div>

        {collapsible && (
          <div className="answers-toggle">
            <Button
              variant="secondary"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? 'Hide answers' : 'See all answers'}
              <ChevronDown
                size={14}
                strokeWidth={1.75}
                className={`toggle-chevron${expanded ? ' is-up' : ''}`}
              />
            </Button>
          </div>
        )}
      </motion.div>
    </LayoutGroup>
  );
}
