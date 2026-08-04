import { ArrowUpRight, FileText, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import AskAssistant from '../components/AskAssistant';

export default function Plans({ entries, onOpenPlan, onGoToChat, onAskAssistant }) {
  const hasLive = entries.some((e) => !e.archived);

  return (
    <div className="view">
      <div className="view-head">
        <div className="view-head-text">
          <h1 className="view-title">Care plans</h1>
          <p className="view-sub">Every plan we’ve put together, newest first.</p>
        </div>
        <AskAssistant onClick={onAskAssistant} />
      </div>

      {!hasLive && (
        <div className="empty">
          <p className="locked-title">No active plan</p>
          <p className="locked-note">
            Answer the questions in the chat and a new plan will appear here.
          </p>
          <Button variant="primary" onClick={onGoToChat}>
            Go to the chat
          </Button>
        </div>
      )}

      <div className="view-list">
        {entries.map((e) => (
          <div
            className="plan-row is-clickable"
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpenPlan(e.id)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                onOpenPlan(e.id);
              }
            }}
          >
            <span className="locked-badge">
              <FileText size={14} strokeWidth={2} />
            </span>
            <div className="cg-main">
              <div className="cg-top">
                <span className="cg-name">{e.title}</span>
                {/* the assistant opens against this plan, right where its title is */}
                <button
                  type="button"
                  className="inline-ask"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onAskAssistant();
                  }}
                  aria-label={`Ask the assistant about the ${e.date} plan`}
                >
                  <Sparkles size={12} strokeWidth={2} />
                  Ask
                </button>
                <span className={`status-pill is-${e.archived ? 'muted' : 'accepted'}`}>
                  {e.status}
                </span>
              </div>
              <div className="cg-meta">
                {e.date} · {e.caregiverCount} caregivers
              </div>
              <p className="booking-detail">{e.summary}</p>
            </div>
            <Button
              variant="secondary"
              onClick={(ev) => {
                ev.stopPropagation();
                onOpenPlan(e.id);
              }}
            >
              Open <ArrowUpRight size={12} strokeWidth={2} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
