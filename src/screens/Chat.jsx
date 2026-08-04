import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { steps } from '../data/flow';
import { buildPlan } from '../data/carePlan';
import QuestionSection, { FOLDABLE_FROM } from '../components/QuestionSection';
import CarePlanCard from '../components/CarePlanCard';
import ChatInput from '../components/ChatInput';

const REPLIES = {
  locked: [
    'Vesna and Snežana have both worked with this combination of tasks before, and they’re free on the days you picked. Tap either of them to get their number.',
    'Noted — I’ve updated the care plan above. The recommendations reflect the change too.',
    'Every caregiver in your list is background-checked and interviewed by our team. Rates are per hour and settled through NANA Prime, never in cash.',
  ],
  unlocked: [
    'Vesna and Snežana have both worked with this combination of tasks before, and they’re free on the days you picked. Vesna usually answers faster.',
    'Noted — I’ve updated the care plan above. The recommendations reflect the change too.',
    'Every caregiver in your list is background-checked and interviewed by our team. Rates are per hour and settled through NANA Prime, never in cash.',
  ],
};

const messageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function Typing() {
  return (
    <motion.div
      className="typing"
      {...messageMotion}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <span />
      <span />
      <span />
    </motion.div>
  );
}

export default function Chat({
  user,
  answers,
  onAnswer,
  plan,
  onPlan,
  unlocked,
  onOpenPlan,
  onSelectCaregiver,
}) {
  const [editing, setEditing] = useState(null); // { stepId, index }
  const [revealed, setRevealed] = useState(1);
  const [planReady, setPlanReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const scrollRef = useRef(null);
  const replyIndex = useRef(0);

  const currentStep = steps[revealed - 1];
  const currentDone = currentStep?.questions.every((q) => answers[q.id]) ?? false;

  // Only one question is ever active. An explicit edit wins; otherwise it is the
  // first unanswered question, which can only be in the step still in progress.
  const activeIndexFor = (step) => {
    if (editing) return editing.stepId === step.id ? editing.index : null;
    const i = step.questions.findIndex((q) => !answers[q.id]);
    return i === -1 ? null : i;
  };

  const commit = (questionId, answer) => {
    onAnswer(questionId, answer);
    setEditing(null);
  };

  // Finishing a step makes the assistant "think", then introduce the next one —
  // and after the last step, post the care plan.
  useEffect(() => {
    if (!currentDone || editing) return;
    if (revealed >= steps.length && planReady) return;
    setThinking(true);
    const t = setTimeout(
      () => {
        setThinking(false);
        if (revealed < steps.length) setRevealed((r) => r + 1);
        else setPlanReady(true);
      },
      revealed < steps.length ? 1100 : 1600
    );
    return () => clearTimeout(t);
  }, [currentDone, editing, revealed, planReady]);

  // Keep the plan in sync so editing an earlier answer updates the artifact.
  useEffect(() => {
    if (planReady) onPlan(buildPlan(answers));
  }, [planReady, answers, onPlan]);

  useEffect(() => {
    const t = setTimeout(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 120);
    return () => clearTimeout(t);
  }, [revealed, thinking, planReady, chatLog.length]);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current
        ?.querySelector('[data-active="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 420);
    return () => clearTimeout(t);
  }, [editing, revealed]);

  const send = (text) => {
    const id = Date.now();
    setChatLog((log) => [...log, { id, role: 'user', text }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const pool = REPLIES[unlocked ? 'unlocked' : 'locked'];
      setChatLog((log) => [
        ...log,
        { id: id + 1, role: 'assistant', text: pool[replyIndex.current++ % pool.length] },
      ]);
    }, 1100);
  };

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-column">
          <motion.p className="assistant-text" {...messageMotion}>
            Hi {user.name.split(' ')[0]} — I’ll ask you a few things about the person you’re caring
            for, then put together a care plan with caregivers matched to it.
          </motion.p>

          {steps.slice(0, revealed).map((step, si) => {
            const activeIndex = activeIndexFor(step);
            const complete = step.questions.every((q) => answers[q.id]);
            // a section folds away once the conversation has moved past it, but only
            // when it is long enough for folding to actually save room
            const collapsible =
              complete &&
              activeIndex === null &&
              (si < revealed - 1 || planReady) &&
              step.questions.length >= FOLDABLE_FROM;
            return (
              <motion.div className="chat-message" key={step.id} {...messageMotion}>
                <p className="assistant-text">{step.intro}</p>
                <QuestionSection
                  step={step}
                  answers={answers}
                  activeIndex={activeIndex}
                  collapsible={collapsible}
                  onCommit={commit}
                  onEdit={(index) => setEditing({ stepId: step.id, index })}
                />
              </motion.div>
            );
          })}

          {planReady && plan && (
            <motion.div className="chat-message" {...messageMotion}>
              <p className="assistant-text">
                That’s everything — here’s the plan for {plan.firstName}, and the caregivers who
                fit it best.
              </p>
              <CarePlanCard
                plan={plan}
                unlocked={unlocked}
                onOpen={onOpenPlan}
                onSelectCaregiver={onSelectCaregiver}
              />
            </motion.div>
          )}

          {chatLog.map((m) =>
            m.role === 'user' ? (
              <motion.div className="bubble-row" key={m.id} {...messageMotion}>
                <div className="bubble">{m.text}</div>
              </motion.div>
            ) : (
              <motion.p className="assistant-text" key={m.id} {...messageMotion}>
                {m.text}
              </motion.p>
            )
          )}

          <AnimatePresence>{thinking && <Typing key="typing" />}</AnimatePresence>
        </div>
      </div>

      <div className="chat-footer">
        <div className="chat-column">
          <ChatInput
            disabled={!planReady}
            placeholder={
              planReady
                ? 'Ask about the care plan, the caregivers, or anything else…'
                : 'Answer the questions above and I’ll build your care plan…'
            }
            onSend={send}
          />
          <p className="footer-note">NANA Prime can make mistakes. Please double-check responses.</p>
        </div>
      </div>
    </div>
  );
}
