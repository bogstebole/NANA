import { ArrowLeft } from 'lucide-react';
import PlanContents from '../components/PlanContents';
import AskAssistant from '../components/AskAssistant';
import Button from '../components/Button';

// A care plan as its own page, reached from the Care plans list or the nav.
export default function PlanDetail({ entry, unlocked, onBack, onSelectCaregiver, onUnlock, onAskAssistant }) {
  const { plan, title, date, status, archived } = entry;

  return (
    <div className="view">
      <div className="view-head">
        <div className="view-head-text">
          <button type="button" className="back-link" onClick={onBack}>
            <ArrowLeft size={13} strokeWidth={2} />
            Care plans
          </button>
          <h1 className="view-title">{title}</h1>
          <p className="view-sub">
            {date} · <span className={`status-pill is-${archived ? 'muted' : 'accepted'}`}>{status}</span>
          </p>
        </div>
        <AskAssistant onClick={onAskAssistant} />
      </div>

      <div className="panel-card">
        {archived ? (
          <p className="doc-p">{entry.summary}</p>
        ) : (
          plan.narrative.map((p, i) => (
            <p className="doc-p" key={i}>
              {p}
            </p>
          ))
        )}
        <div className="facts">
          {plan.facts.map((f) => (
            <div className="fact" key={f.label}>
              <span className="fact-label">{f.label}</span>
              <span className="fact-value">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <PlanContents
        plan={{ ...plan, caregiverCount: entry.caregiverCount }}
        unlocked={unlocked}
        archived={archived}
        onSelectCaregiver={onSelectCaregiver}
        onUnlock={onUnlock}
      />

      {archived && (
        <div className="panel-card-actions">
          <Button variant="secondary" onClick={onBack}>
            Back to all plans
          </Button>
        </div>
      )}
    </div>
  );
}
