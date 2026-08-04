import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { STATUS_LABEL, bookingsWithCaregiver, statusCounts } from '../data/bookings';
import Button from '../components/Button';
import AskAssistant from '../components/AskAssistant';

const STATUS_ICON = { accepted: CheckCircle2, pending: Clock, declined: XCircle };

function StatusPill({ status }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`status-pill is-${status}`}>
      <Icon size={12} strokeWidth={2} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function Dashboard({ hasBookings, onGoToChat, onAskAssistant }) {
  const counts = statusCounts();
  const rows = bookingsWithCaregiver();

  return (
    <div className="view">
      <div className="view-head">
        <div className="view-head-text">
          <h1 className="view-title">Dashboard</h1>
          <p className="view-sub">Where every caregiver request stands right now.</p>
        </div>
        <AskAssistant onClick={onAskAssistant} />
      </div>

      {!hasBookings ? (
        <div className="empty">
          <p className="locked-title">No requests yet</p>
          <p className="locked-note">
            Finish your care plan and request a caregiver — you’ll be able to track every reply here.
          </p>
          <Button variant="primary" onClick={onGoToChat}>
            Go to the chat
          </Button>
        </div>
      ) : (
        <>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-value">{counts.accepted}</span>
              <span className="stat-label">Accepted</span>
            </div>
            <div className="stat">
              <span className="stat-value">{counts.pending}</span>
              <span className="stat-label">Waiting</span>
            </div>
            <div className="stat">
              <span className="stat-value">{counts.declined}</span>
              <span className="stat-label">Declined</span>
            </div>
          </div>

          <div className="view-list">
            {rows.map((b) => (
              <div className={`booking is-${b.status}`} key={b.caregiverId}>
                <div className="cg-avatar">{b.caregiver.initials}</div>
                <div className="cg-main">
                  <div className="cg-top">
                    <span className="cg-name">{b.caregiver.name}</span>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="cg-meta">
                    {b.caregiver.rate} · {b.caregiver.area} · requested {b.requested}
                  </div>
                  <p className={`booking-detail${b.status === 'declined' ? ' is-reason' : ''}`}>
                    {b.status === 'declined' && <strong>Reason: </strong>}
                    {b.detail}
                  </p>
                  {b.status === 'accepted' && (
                    <div className="booking-actions">
                      <a
                        className="cg-phone is-open"
                        href={`tel:${b.caregiver.phone.replace(/\s/g, '')}`}
                      >
                        {b.caregiver.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
