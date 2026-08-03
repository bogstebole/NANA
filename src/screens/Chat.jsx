import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { questions } from '../data/flow';
import { buildPlan } from '../data/carePlan';
import QuestionItem from '../components/QuestionItem';
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

export default function Chat({ user, plan, onPlan, unlocked, onOpenPlan, onSelectCaregiver }) {
  const [answers, setAnswers] = useState({});
  const [editing, setEditing] = useState(null);
  const [planReady, setPlanReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const scrollRef = useRef(null);
  const replyIndex = useRef(0);

  const allAnswered = questions.every((q) => answers[q.id]);
  const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
  const activeIndex = editing != null ? editing : firstUnanswered === -1 ? null : firstUnanswered;

  const commit = (questionId, answer) => {
    setAnswers((a) => ({ ...a, [questionId]: answer }));
    setEditing(null);
  };

  // Once every question is answered the assistant "thinks", then posts the plan.
  useEffect(() => {
    if (!allAnswered || planReady) return;
    setThinking(true);
    const t = setTimeout(() => {
      setThinking(false);
      setPlanReady(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [allAnswered, planReady]);

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
  }, [thinking, planReady, chatLog.length]);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current
        ?.querySelector('[data-active="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 420);
    return () => clearTimeout(t);
  }, [activeIndex]);

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
          <motion.div className="chat-message" {...messageMotion}>
            <p className="assistant-text">
              Hi {user.name.split(' ')[0]} — I’ll ask you a few things about the person you’re
              caring for, then put together a care plan with caregivers matched to it.
            </p>
            <p className="assistant-text">
              Let’s get started. First, we need few information about an elderly person.
            </p>

            {/* one section for every question: answered ones collapse, one is active,
                and the rest stay listed so the remaining effort is always visible */}
            <LayoutGroup>
              <motion.div layout className="workflow-card" style={{ borderRadius: 32 }}>
                {questions.map((q, i) => (
                  <QuestionItem
                    key={q.id}
                    question={q}
                    number={i + 1}
                    state={i === activeIndex ? 'active' : answers[q.id] ? 'collapsed' : 'upcoming'}
                    isActive={i === activeIndex}
                    answer={answers[q.id]}
                    onCommit={(a) => commit(q.id, a)}
                    onEdit={() => setEditing(i)}
                  />
                ))}
              </motion.div>
            </LayoutGroup>
          </motion.div>

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
