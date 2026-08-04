import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { copilotContext } from '../data/copilot';
import SidePanel from './SidePanel';
import ChatInput from './ChatInput';

const messageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

// The assistant as a co-pilot: it opens against whatever page you were on and
// keeps a separate thread per page, so switching views does not mix conversations.
export default function CopilotPanel({ view, plan, unlocked, onClose }) {
  const ctx = copilotContext(view, { plan, unlocked });
  const [logByView, setLogByView] = useState({});
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef(null);
  const replyIndex = useRef(0);

  const log = logByView[view] || [];

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [log.length, thinking, view]);

  const send = (text) => {
    const id = Date.now();
    setLogByView((l) => ({ ...l, [view]: [...(l[view] || []), { id, role: 'user', text }] }));
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const reply = ctx.replies[replyIndex.current++ % ctx.replies.length];
      setLogByView((l) => ({
        ...l,
        [view]: [...(l[view] || []), { id: id + 1, role: 'assistant', text: reply }],
      }));
    }, 1000);
  };

  return (
    <SidePanel
      eyebrow={`Assistant · ${ctx.label}`}
      title="How can I help?"
      onClose={onClose}
      footer={
        <div className="copilot-footer">
          <ChatInput placeholder="Ask about this page…" onSend={send} />
        </div>
      }
    >
      <div className="copilot-body" ref={bodyRef}>
        <p className="assistant-text">{ctx.opening}</p>

        {log.length === 0 && (
          <div className="copilot-suggestions">
            {ctx.suggestions.map((s) => (
              <button key={s} type="button" className="suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

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

        <AnimatePresence>
          {thinking && (
            <motion.div
              key="typing"
              className="typing"
              {...messageMotion}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <span />
              <span />
              <span />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SidePanel>
  );
}
