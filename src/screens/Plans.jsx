import { ArrowUpRight } from 'lucide-react';
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
        {/* the whole row is the target — the arrow on hover is the only affordance
            it needs, so there is no button competing with it */}
        {entries.map((e) => (
          <div
            className="plan-row"
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
            <div className="plan-row-main">
              <div className="plan-row-top">
                <span className="plan-row-title">{e.title}</span>
                <span className={`status-pill is-${e.archived ? 'muted' : 'accepted'}`}>
                  {e.status}
                </span>
                <ArrowUpRight size={14} strokeWidth={2} className="plan-row-go" aria-hidden="true" />
              </div>
              <p className="plan-row-meta">
                {e.date} · {e.caregiverCount} caregivers
              </p>
              <p className="plan-row-summary">{e.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
