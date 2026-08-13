import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  Clock,
  FileCheck2,
  FilePen,
  FileText,
  Inbox,
  Meh,
  MessageSquare,
  Phone,
  Send,
  Smile,
  StickyNote,
  Frown,
} from 'lucide-react';
import Button from '../../components/Button';
import {
  DEFAULT_RATE,
  SERVICES,
  agreementState,
  frailtyLabel,
  money,
  serviceTitle,
  totalsFor,
} from '../../data/caregiverBoard';

// Everything the caregiver knows about one family, on one page: the terms she
// works under, the visits those terms have produced, and the story of the
// relationship around both. The three answer different questions — what is
// agreed, what was done and what was paid, and what has passed between us —
// which is why they are three sections and not one feed.

const MOOD = {
  low: { icon: Frown, label: 'Low' },
  usual: { icon: Meh, label: 'As usual' },
  good: { icon: Smile, label: 'Good' },
};

const ACTIVITY_ICON = {
  request: Inbox,
  accepted: Check,
  'agreement-sent': FileText,
  'agreement-signed': FileCheck2,
  'agreement-changed': FilePen,
  visit: CalendarCheck,
  'work-order': Send,
  note: StickyNote,
  message: MessageSquare,
};

function Section({ title, badge, children }) {
  return (
    <section className="panel-card">
      <div className="panel-card-head">
        <p className="doc-section-title">{title}</p>
        {badge}
      </div>
      {children}
    </section>
  );
}

// The draft: which services, and one rate. Both are pre-filled from what the
// family actually asked for, so the common case is reading it and pressing send
// rather than building it from nothing.
function AgreementDraft({ client, onSend, onCancel }) {
  const [services, setServices] = useState(client.needs);
  const [rate, setRate] = useState(String(client.rate || DEFAULT_RATE));

  const toggle = (id) =>
    setServices((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const rateNumber = Number(rate);
  const valid = services.length > 0 && rateNumber > 0;
  const weekly = valid ? rateNumber * client.hours : 0;

  return (
    <>
      <p className="ag-lead">
        The agreement sets out which services you provide and one shared hourly rate. Everything
        after this — visits, work orders, payments — is calculated from it.
      </p>

      <p className="ag-label">Services this agreement covers</p>
      <div className="ag-services">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`svc${services.includes(s.id) ? ' is-on' : ''}`}
            onClick={() => toggle(s.id)}
            aria-pressed={services.includes(s.id)}
          >
            {services.includes(s.id) && <Check size={13} strokeWidth={2.5} />}
            {s.title}
          </button>
        ))}
      </div>
      <p className="ag-hint">
        Ticked from what {client.family} asked for. Add or remove anything that does not match.
      </p>

      <p className="ag-label">Hourly rate</p>
      <div className="ag-rate">
        <input
          type="number"
          inputMode="numeric"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          aria-label="Hourly rate in dinars"
        />
        <span className="ag-rate-suffix">RSD / h</span>
      </div>
      {valid && (
        <p className="ag-hint">
          At {client.hours} h a week that is {money(weekly)} a week, {money(totalsFor(client.hours, rateNumber).net)}{' '}
          to you after the 10% service fee.
        </p>
      )}

      <div className="panel-card-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          onClick={() => onSend(client.id, { services, rate: rateNumber })}
        >
          <Send size={14} strokeWidth={1.75} />
          Send to client
        </Button>
      </div>
    </>
  );
}

function AgreedTerms({ client }) {
  return (
    <>
      <p className="ag-label">Services this agreement covers</p>
      <div className="ag-services">
        {client.services.map((id) => (
          <span key={id} className="svc is-set">
            <Check size={13} strokeWidth={2.5} />
            {serviceTitle(id)}
          </span>
        ))}
      </div>
      <div className="bc-lines ag-terms">
        <p className="bc-line">
          <span className="bc-line-label">Hourly rate</span>
          <span className="bc-line-value">{money(client.rate)} / h</span>
        </p>
        <p className="bc-line">
          <span className="bc-line-label">Agreed hours</span>
          <span className="bc-line-value">{client.hours} h/week</span>
        </p>
        <p className="bc-line">
          <span className="bc-line-label">Pattern</span>
          <span className="bc-line-value">{client.schedule}</span>
        </p>
      </div>
    </>
  );
}

function Visits({ client }) {
  const visits = client.visits || [];
  if (!visits.length) {
    return (
      <p className="board-empty">
        No visits yet. They start once {client.family} signs the agreement.
      </p>
    );
  }

  const hours = visits.reduce((n, v) => n + v.hours, 0);
  const earned = visits.reduce((n, v) => n + totalsFor(v.hours, client.rate).net, 0);

  return (
    <>
      <p className="ag-hint">
        {visits.length} visits · {hours} h · {money(earned)} to you
      </p>
      <ul className="visit-list">
        {visits.map((v, i) => {
          const Mood = MOOD[v.mood]?.icon;
          const totals = totalsFor(v.hours, client.rate);
          return (
            <li key={`${v.date}-${i}`} className="visit">
              <div className="visit-head">
                <p className="visit-when">
                  {v.date} · {v.time}
                </p>
                <span className={`status-pill is-${v.status === 'due' ? 'pending' : 'accepted'}`}>
                  {v.status === 'due' ? 'Work order due' : 'Paid'}
                </span>
              </div>
              <p className="visit-note">{v.note}</p>
              <div className="visit-foot">
                {Mood && (
                  <span className="visit-mood">
                    <Mood size={13} strokeWidth={1.75} />
                    {MOOD[v.mood].label}
                  </span>
                )}
                <span className="visit-money">
                  {v.hours} h · {money(totals.net)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Activity({ client }) {
  // Newest first: the last thing that happened is the thing she is trying to
  // remember when she opens this.
  const entries = [...(client.activity || [])].reverse();
  return (
    <ol className="timeline">
      {entries.map((e, i) => {
        const Icon = ACTIVITY_ICON[e.kind] || StickyNote;
        return (
          <li key={i} className="tl-item">
            <span className="tl-dot">
              <Icon size={13} strokeWidth={1.75} />
            </span>
            <div className="tl-body">
              <p className="tl-text">{e.text}</p>
              <p className="tl-when">{e.when}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function ClientPage({ client, onBack, onSendAgreement, onRemind }) {
  const state = agreementState(client);

  const badge = {
    none: <span className="status-pill is-muted">Not accepted</span>,
    draft: <span className="status-pill is-pending">Draft</span>,
    sent: (
      <span className="status-pill is-pending">
        <Clock size={12} strokeWidth={2} />
        Waiting for signature
      </span>
    ),
    active: (
      <span className="status-pill is-accepted">
        <Check size={12} strokeWidth={2} />
        Active since {client.since}
      </span>
    ),
  }[state];

  return (
    <motion.div
      className="view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
    >
      <div className="view-head">
        <div className="view-head-text">
          <button type="button" className="back-link" onClick={onBack}>
            <ArrowLeft size={14} strokeWidth={1.75} />
            Board
          </button>
        </div>
      </div>

      <header className="client-head">
        <span className="cg-avatar">{client.initials}</span>
        <div className="client-head-text">
          <h1 className="view-title">{client.elder}</h1>
          <p className="view-sub">
            {client.age} · {client.area} · {client.distance} · CFS {client.frailty},{' '}
            {frailtyLabel(client.frailty)}
          </p>
        </div>
      </header>

      <div className="client-contact">
        <p className="bc-line">
          <span className="bc-line-label">Family contact</span>
          <span className="bc-line-value">
            {client.family} · {client.relation}
          </span>
        </p>
        <p className="bc-line">
          <span className="bc-line-label">
            <Phone size={12} strokeWidth={1.75} /> Phone
          </span>
          <span className="bc-line-value">{client.phone}</span>
        </p>
      </div>

      <Section title="Care agreement" badge={badge}>
        {state === 'draft' && (
          <AgreementDraft client={client} onSend={onSendAgreement} onCancel={onBack} />
        )}

        {state === 'sent' && (
          <>
            <p className="ag-lead">
              Sent {client.sentOn}. Nothing can be scheduled until {client.family} signs it.
              {client.remindedOn && ` Reminder sent ${client.remindedOn}.`}
            </p>
            <AgreedTerms client={client} />
            <div className="panel-card-actions">
              <Button variant="secondary" onClick={() => onRemind(client.id)}>
                <Send size={14} strokeWidth={1.75} />
                Send a reminder
              </Button>
            </div>
          </>
        )}

        {state === 'active' && (
          <>
            <p className="ag-lead">
              Every visit and work order below is calculated from these terms.
            </p>
            <AgreedTerms client={client} />
          </>
        )}

        {state === 'none' && (
          <p className="ag-lead">
            {client.family} asked for {client.hours} h a week, {client.schedule.toLowerCase()}.
            Accept the request on the board and the agreement opens here.
          </p>
        )}
      </Section>

      <Section title="Visits">
        <Visits client={client} />
      </Section>

      <Section title="Activity">
        <Activity client={client} />
      </Section>
    </motion.div>
  );
}
