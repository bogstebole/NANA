import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, Check, Clock, FileText, Send, X } from 'lucide-react';
import Button from '../Button';
import Chip from '../Chip';
import { frailtyLabel, money, workOrderTotals } from '../../data/caregiverBoard';

// One family, on the caregiver's board. The card is the same object in every
// column — same person, same header — and only the middle and the buttons
// change, because what changes between columns is not who they are but what is
// owed to them next.

function Pill({ tone, icon: Icon, children }) {
  return (
    <span className={`status-pill is-${tone}`}>
      {Icon && <Icon size={12} strokeWidth={2} />}
      {children}
    </span>
  );
}

// The request that has been sitting longest is the one that reads as being
// ignored, so waiting is stated in the units it hurts in.
function waitedFor(client) {
  if (client.waitingDays) return `${client.waitingDays} days waiting`;
  return `${client.waitingHours} h ago`;
}

function Status({ client }) {
  if (client.stage === 'request') {
    const stale = Boolean(client.waitingDays);
    return (
      <Pill tone={stale ? 'pending' : 'muted'} icon={Clock}>
        {waitedFor(client)}
      </Pill>
    );
  }
  if (client.stage === 'agreement') {
    return client.agreementSent ? (
      <Pill tone="pending" icon={Clock}>
        Waiting for signature
      </Pill>
    ) : (
      <Pill tone="accepted" icon={Check}>
        Accepted
      </Pill>
    );
  }
  if (client.stage === 'active') {
    return <Pill tone="muted">Since {client.since}</Pill>;
  }
  // A work order charges itself after 24 hours, so the number that matters is
  // how long she still has to correct it.
  const urgent = client.dueInHours <= 6;
  return (
    <Pill tone={urgent ? 'declined' : 'pending'} icon={urgent ? AlertTriangle : Clock}>
      {client.dueInHours} h left
    </Pill>
  );
}

function Line({ label, value }) {
  return (
    <p className="bc-line">
      <span className="bc-line-label">{label}</span>
      <span className="bc-line-value">{value}</span>
    </p>
  );
}

// The ref is not decoration: the board's columns animate with `popLayout`, which
// measures a leaving card so the ones under it can close the gap smoothly, and
// it can only measure a child that hands back a DOM node.
const BoardCard = forwardRef(function BoardCard(
  { client, onAccept, onDecline, onAgreement, onLogVisit, onSendWorkOrder },
  ref
) {
  const totals = client.stage === 'work-order' ? workOrderTotals(client) : null;

  return (
    <motion.article
      ref={ref}
      layout
      className="bc"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div className="bc-head">
        <span className="cg-avatar">{client.initials}</span>
        {/* The age sits with the place, not with the name: on the same line as
            the name it left long names wrapping around a two-character number
            and the status pill pushed off on its own. */}
        <div className="bc-id">
          <p className="bc-name">{client.elder}</p>
          <p className="bc-meta">
            {client.age} · {client.area} · {client.distance}
          </p>
        </div>
        <Status client={client} />
      </div>

      {client.stage === 'request' && (
        <>
          <p className="bc-frailty">
            CFS {client.frailty} · {frailtyLabel(client.frailty)}
          </p>
          <div className="bc-chips">
            {client.needs.map((n) => (
              <Chip key={n}>{n}</Chip>
            ))}
          </div>
          <div className="bc-lines">
            <Line label="Hours" value={`${client.hours} h/week`} />
            <Line label="When" value={client.schedule} />
            <Line label="Starts" value={client.startsOn} />
            <Line label="Asked by" value={`${client.family} · ${client.relation}`} />
          </div>
        </>
      )}

      {client.stage === 'agreement' && !client.agreementSent && (
        <>
          <p className="bc-note">
            Accepted {client.acceptedOn}. Set the services and the hourly rate — every visit,
            work order and payment after this is calculated from it.
          </p>
          <div className="bc-chips">
            {client.needs.map((n) => (
              <Chip key={n}>{n}</Chip>
            ))}
          </div>
          <div className="bc-lines">
            <Line label="Hours" value={`${client.hours} h/week`} />
            <Line label="When" value={client.schedule} />
          </div>
        </>
      )}

      {client.stage === 'agreement' && client.agreementSent && (
        <>
          <p className="bc-note">
            Sent {client.sentOn}. Nothing can be scheduled until {client.family} signs it.
            {client.remindedOn && ` Reminder sent ${client.remindedOn}.`}
          </p>
          <div className="bc-lines">
            <Line label="Rate" value={`${money(client.rate)}/h`} />
            <Line label="Hours" value={`${client.hours} h/week`} />
          </div>
        </>
      )}

      {client.stage === 'active' && (
        <div className="bc-lines">
          <Line label="Next visit" value={client.nextVisit} />
          <Line label="Rate" value={`${money(client.rate)}/h`} />
          <Line label="Agreed" value={`${client.hours} h/week`} />
        </div>
      )}

      {client.stage === 'work-order' && (
        <>
          <div className="bc-lines">
            <Line label="Visit" value={`${client.visit.date} · ${client.visit.time}`} />
            <Line label="Worked" value={`${client.visit.hours} h at ${money(client.rate)}/h`} />
          </div>
          <div className="bc-total">
            <Line label="Charged" value={money(totals.charged)} />
            <Line label="Service fee (10%)" value={`−${money(totals.fee)}`} />
            <p className="bc-line is-net">
              <span className="bc-line-label">You receive</span>
              <span className="bc-line-value">{money(totals.net)}</span>
            </p>
          </div>
        </>
      )}

      <div className="bc-actions">
        {client.stage === 'request' && (
          <>
            <Button variant="secondary" onClick={() => onDecline(client.id)}>
              <X size={14} strokeWidth={2} />
              Decline
            </Button>
            <Button variant="primary" onClick={() => onAccept(client.id)}>
              <Check size={14} strokeWidth={2} />
              Accept
            </Button>
          </>
        )}

        {client.stage === 'agreement' && !client.agreementSent && (
          <Button variant="primary" onClick={() => onAgreement(client.id)}>
            <FileText size={14} strokeWidth={1.75} />
            Set up agreement
          </Button>
        )}

        {client.stage === 'agreement' && client.agreementSent && (
          <Button variant="secondary" onClick={() => onAgreement(client.id)}>
            <Send size={14} strokeWidth={1.75} />
            Send a reminder
          </Button>
        )}

        {client.stage === 'active' && (
          <Button variant="secondary" onClick={() => onLogVisit(client.id)}>
            <CalendarClock size={14} strokeWidth={1.75} />
            Log a visit
          </Button>
        )}

        {client.stage === 'work-order' && (
          <Button variant="primary" onClick={() => onSendWorkOrder(client.id)}>
            <Send size={14} strokeWidth={1.75} />
            Send work order
          </Button>
        )}
      </div>
    </motion.article>
  );
});

export default BoardCard;
