import { motion } from 'framer-motion';
import { Archive, FileText } from 'lucide-react';
import Button from '../components/Button';

const messageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// A past conversation, read only. It shows what the chat concluded rather than
// replaying the questionnaire — the summary, the facts it collected, and whatever
// was said afterwards.
export default function ArchivedChat({ thread, onNewChat }) {
  return (
    <div className="chat">
      <div className="chat-scroll">
        <div className="chat-column">
          <motion.p className="assistant-text" {...messageMotion}>
            This is the plan we put together on {thread.date}.
          </motion.p>

          <motion.div className="chat-message" {...messageMotion}>
            <div className="workflow-card care-plan">
              <div className="doc is-static">
                <div className="doc-head">
                  <FileText size={14} strokeWidth={1.75} className="doc-icon" />
                  <div className="doc-head-text">
                    <p className="doc-eyebrow">
                      Care plan <span className="doc-meta">· {thread.date}</span>
                    </p>
                    <p className="doc-title">{thread.title}</p>
                  </div>
                  <span className="status-pill is-muted">Archived</span>
                </div>

                <p className="doc-p">{thread.summary}</p>

                <div className="facts">
                  {thread.facts.map((f) => (
                    <div className="fact" key={f.label}>
                      <span className="fact-label">{f.label}</span>
                      <span className="fact-value">{f.value}</span>
                    </div>
                  ))}
                </div>

                <p className="tip-body">
                  {thread.caregivers} caregivers were matched to this plan.
                </p>
              </div>
            </div>
          </motion.div>

          {thread.messages.map((m, i) =>
            m.role === 'user' ? (
              <motion.div className="bubble-row" key={i} {...messageMotion}>
                <div className="bubble">{m.text}</div>
              </motion.div>
            ) : (
              <motion.p className="assistant-text" key={i} {...messageMotion}>
                {m.text}
              </motion.p>
            )
          )}
        </div>
      </div>

      <div className="chat-footer">
        <div className="chat-column">
          <div className="archived-bar">
            <Archive size={14} strokeWidth={1.75} />
            <span>This conversation is archived.</span>
            <Button variant="secondary" onClick={onNewChat}>
              Start a new chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
