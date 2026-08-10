import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, KeyRound } from 'lucide-react';
import { questionById } from '../data/flow';
import { frailtyOf } from '../data/frailty';
import { remainingQuestions, systemPrompt } from '../data/conversation';
import { Q, CFS_SR } from '../data/flow.sr';
import { buildPlan } from '../data/carePlan';
import { createClient, runTurn } from '../lib/claudeChat';
import FrailtyCard, { SR as FRAILTY_SR } from '../components/FrailtyCard';
import CarePlanCard from '../components/CarePlanCard';
import Button from '../components/Button';
import ChatInput from '../components/ChatInput';

const letterFor = (i) => String.fromCharCode(97 + i);

const messageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function Typing() {
  return (
    <motion.div className="typing" {...messageMotion} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
      <span />
      <span />
      <span />
    </motion.div>
  );
}

// The cards Claude puts on screen when it calls `ask`. They are rendered from
// flow.js, not from anything the model wrote — so a tap always produces a real
// option id, and the answer is committed here rather than round-tripped.
function AnswerCards({ question, onPick }) {
  const sr = Q[question.id] || {};
  const [ids, setIds] = useState([]);
  const [other, setOther] = useState('');
  const [values, setValues] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (question.type === 'inputs') {
      const t = setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 300);
      return () => clearTimeout(t);
    }
  }, [question.id, question.type]);

  if (question.type === 'inputs') {
    const ready = question.fields.every((f) => f.optional || (values[f.id] || '').trim());
    const commit = () =>
      ready &&
      onPick(
        { values },
        question.fields.map((f) => values[f.id]).filter(Boolean).join(', ')
      );
    return (
      <div className="conv-answer">
        <div className="selection-container">
          {question.fields.map((f, i) => (
            <label className="select-input" key={f.id}>
              <div className="si-content">
                <span className="si-label">{sr.fields?.[f.id] || f.label}</span>
                <input
                  ref={i === 0 ? firstRef : undefined}
                  type="text"
                  value={values[f.id] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && commit()}
                />
              </div>
            </label>
          ))}
        </div>
        <div className="card-footer">
          <Button variant="secondary" disabled={!ready} onClick={commit}>
            Dalje
          </Button>
        </div>
      </div>
    );
  }

  const label = (o) => sr.options?.[o.id] || o.title;

  if (question.type === 'single') {
    return (
      <div className="conv-answer">
        <div className="selection-container">
          {question.options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              className="select-card"
              onClick={() => onPick({ optionId: o.id }, label(o))}
            >
              <span className="number-indicator">{letterFor(i)}</span>
              <div className="sc-content">
                <div className="sc-title">{label(o)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const picked = question.options.filter((o) => ids.includes(o.id)).map(label);
  const free = other.trim();
  const empty = !ids.length && !free;
  const toggle = (id) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="conv-answer">
      <div className="selection-container">
        {question.options.map((o, i) => (
          <button
            key={o.id}
            type="button"
            className={`select-card${ids.includes(o.id) ? ' selected' : ''}`}
            onClick={() => toggle(o.id)}
          >
            <span className={`number-indicator${ids.includes(o.id) ? ' selected' : ''}`}>
              {letterFor(i)}
            </span>
            <div className="sc-content">
              <div className="sc-title">{label(o)}</div>
            </div>
          </button>
        ))}
        {question.allowOther && (
          <label className={`select-card is-other${free ? ' selected' : ''}`}>
            <span className={`number-indicator${free ? ' selected' : ''}`}>
              {letterFor(question.options.length)}
            </span>
            <div className="sc-content">
              <input
                type="text"
                className="sc-other-input"
                value={other}
                placeholder={sr.other || 'Nešto drugo'}
                onChange={(e) => setOther(e.target.value)}
              />
            </div>
          </label>
        )}
      </div>
      <div className="card-footer">
        <Button
          variant="secondary"
          disabled={!question.allowEmpty && empty}
          onClick={() =>
            onPick(
              { optionIds: ids, ...(free ? { other: free } : {}) },
              [...picked, ...(free ? [free] : [])].join(', ') || sr.empty || 'Ništa od toga'
            )
          }
        >
          {question.allowEmpty && empty ? sr.empty || 'Ništa od toga' : 'Dalje'}
        </Button>
      </div>
    </div>
  );
}

// The third variant: the same questions and the same answers, asked by Claude in
// its own words. Every option the user can tap still comes from flow.js.
export default function Conversation({
  user,
  answers,
  onAnswer,
  apiKey,
  plan,
  onPlan,
  unlocked,
  onOpenPlan,
  onSelectCaregiver,
  onChangeKey,
  onFallback,
}) {
  const [log, setLog] = useState([]);
  const [asked, setAsked] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const history = useRef([]);
  const started = useRef(false);
  const scrollRef = useRef(null);

  const client = useMemo(() => createClient(apiKey), [apiKey]);
  const system = useMemo(() => systemPrompt(user), [user]);

  const frailty = frailtyOf(answers);
  const done = remainingQuestions(answers).length === 0 && !!answers['about-person'];
  const planName = answers['about-person']?.values?.name?.trim().split(' ')[0] || 'nju';

  const turn = useCallback(
    async (text, display, seed) => {
      const id = Date.now();
      if (display) setLog((l) => [...l, { id, role: 'user', text: display }]);
      history.current.push({ role: 'user', content: text });

      setAsked(null);
      setBusy(true);
      setError(null);

      const replyId = id + 1;

      try {
        const result = await runTurn({
          client,
          system,
          messages: history.current,
          answers: seed,
          // The updater has to be pure: StrictMode runs it twice, so deciding
          // "first delta?" from an outer flag made the second run take the
          // already-appended branch against the original list and drop the
          // message. Read the answer out of the list itself instead.
          onText: (delta) => {
            setLog((l) =>
              l.some((m) => m.id === replyId)
                ? l.map((m) => (m.id === replyId ? { ...m, text: m.text + delta } : m))
                : [...l, { id: replyId, role: 'assistant', text: delta }]
            );
          },
          onAnswer,
          onAsk: (questionId) => setAsked(questionId),
        });
        history.current = result.messages;
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setBusy(false);
      }
    },
    [client, system, onAnswer]
  );

  // Kick the conversation off once. The opening instruction is ours, not the
  // user's, so it never appears in the thread.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    turn('Počni razgovor.', null, answers);
  }, [turn, answers]);

  useEffect(() => {
    const t = setTimeout(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 120);
    return () => clearTimeout(t);
  }, [log, asked, busy]);

  useEffect(() => {
    if (done && !plan) onPlan(buildPlan(answers));
  }, [done, plan, answers, onPlan]);

  const pick = (answer, label) => {
    const question = questionById[asked];
    if (!question) return;
    onAnswer(asked, answer);
    turn(`(izabrano) ${label}`, label, { ...answers, [asked]: answer });
  };

  const question = asked ? questionById[asked] : null;
  const srFrailty = frailty && CFS_SR[frailty.level]
    ? { ...frailty, label: CFS_SR[frailty.level].label, blurb: CFS_SR[frailty.level].blurb }
    : frailty;

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-column">
          {log.map((m) =>
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

          <AnimatePresence>{busy && <Typing key="typing" />}</AnimatePresence>

          {question && !busy && (
            <motion.div className="workflow-card" key={question.id} {...messageMotion}>
              <AnswerCards question={question} onPick={pick} />
            </motion.div>
          )}

          {done && srFrailty && (
            <motion.div className="chat-message" {...messageMotion}>
              <FrailtyCard frailty={srFrailty} name={planName} copy={FRAILTY_SR} />
            </motion.div>
          )}

          {done && plan && (
            <motion.div className="chat-message" {...messageMotion}>
              <CarePlanCard
                plan={plan}
                unlocked={unlocked}
                onOpen={onOpenPlan}
                onSelectCaregiver={onSelectCaregiver}
              />
            </motion.div>
          )}

          {error && (
            <motion.div className="conv-error" {...messageMotion}>
              <AlertTriangle size={14} strokeWidth={2} />
              <div>
                <p className="conv-error-title">Razgovor je pao</p>
                <p className="conv-error-note">{error}</p>
                <div className="conv-error-actions">
                  <Button variant="secondary" onClick={onChangeKey}>
                    <KeyRound size={13} strokeWidth={2} /> Promeni ključ
                  </Button>
                  <Button variant="secondary" onClick={onFallback}>
                    Nastavi klasičnim upitnikom
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="chat-footer">
        <div className="chat-column">
          <ChatInput
            disabled={busy}
            placeholder={
              busy ? 'Jovana kuca…' : 'Odgovorite karticama ili napišite svojim rečima…'
            }
            onSend={(text) => turn(text, text, answers)}
          />
          <p className="footer-note">
            Jovana je AI i može da pogreši. Odgovore uvek proverite.
          </p>
        </div>
      </div>
    </div>
  );
}
