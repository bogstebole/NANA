import { ArrowUpRight, FileText } from 'lucide-react';
import { archivedPlans } from '../data/bookings';
import { caregivers } from '../data/carePlan';
import Button from '../components/Button';

const today = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function Plans({ plan, onOpenPlan, onGoToChat }) {
  const live = plan
    ? {
        id: 'live',
        name: plan.name,
        date: today,
        status: 'Active',
        caregivers: caregivers.length,
        note: 'Built from your answers in the chat.',
      }
    : null;

  const rows = [live, ...archivedPlans].filter(Boolean);

  return (
    <div className="view">
      <div className="view-head">
        <h1 className="view-title">Care plans</h1>
        <p className="view-sub">Every plan we’ve put together, newest first.</p>
      </div>

      {!plan && (
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
        {rows.map((p) => (
          <div className="plan-row" key={p.id}>
            <span className="locked-badge">
              <FileText size={14} strokeWidth={2} />
            </span>
            <div className="cg-main">
              <div className="cg-top">
                <span className="cg-name">Care plan for {p.name}</span>
                <span className={`status-pill is-${p.status === 'Active' ? 'accepted' : 'muted'}`}>
                  {p.status}
                </span>
              </div>
              <div className="cg-meta">
                {p.date} · {p.caregivers} caregivers
              </div>
              <p className="booking-detail">{p.note}</p>
            </div>
            {p.id === 'live' && (
              <Button variant="secondary" onClick={onOpenPlan}>
                Open <ArrowUpRight size={12} strokeWidth={2} />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
