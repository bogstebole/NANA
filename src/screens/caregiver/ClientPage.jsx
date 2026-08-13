import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
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
import Modal from '../../components/Modal';
import AgreementForm from '../../components/caregiver/AgreementForm';
import WorkOrderForm from '../../components/caregiver/WorkOrderForm';
import {
  agreementState,
  dueVisit,
  frailtyLabel,
  money,
  serviceShort,
  serviceTitle,
  totalsFor,
} from '../../data/caregiverBoard';

// Everything the caregiver knows about one family, on one page: the terms she
// works under, the visits those terms have produced, and the story of the
// relationship around both. The three answer different questions — what is
// agreed, what was done and what was paid, and what has passed between us —
// which is why they are three sections and not one feed.
//
// The page reads; it does not ask. Setting the agreement and filling in a work
// order are forms, and forms live in a dialog — left open on the page they made
// it look like something was unfinished every time it was opened, and buried
// the overview under an empty form.

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

const AMOUNT_WORD = { less: 'less than usual', usual: 'as usual', more: 'more than usual' };

function Visits({ client }) {
  // The visit still waiting on its work order is not in here — it is the form
  // above, and listing it twice would say a visit is both done and outstanding.
  const visits = (client.visits || []).filter((v) => v.status !== 'due');
  if (!visits.length) {
    return (
      <p className="board-empty">
        No visits settled yet. They start once {client.family} signs the agreement.
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
                <span className="status-pill is-accepted">Paid</span>
              </div>
              <p className="visit-note">{v.note}</p>
              {v.services?.length > 0 && (
                <p className="visit-services">{v.services.map(serviceShort).join(' · ')}</p>
              )}
              {v.concern && (
                <p className="visit-concern">
                  <AlertTriangle size={12} strokeWidth={2} />
                  {v.concern}
                </p>
              )}
              <div className="visit-foot">
                {Mood && (
                  <span className="visit-mood">
                    <Mood size={13} strokeWidth={1.75} />
                    {MOOD[v.mood].label}
                  </span>
                )}
                {v.eating && <span className="visit-mood">ate {AMOUNT_WORD[v.eating]}</span>}
                {v.moving && <span className="visit-mood">moved {AMOUNT_WORD[v.moving]}</span>}
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

export default function ClientPage({ client, onBack, onSendAgreement, onRemind, onSendWorkOrder }) {
  const state = agreementState(client);
  const due = dueVisit(client);
  const [modal, setModal] = useState(null); // null | 'agreement' | 'work-order'

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
          <>
            <p className="ag-lead">
              Accepted {client.acceptedOn}. Nothing can be scheduled until the agreement is set —
              every visit, work order and payment after it is calculated from it.
            </p>
            <p className="ag-label">What {client.family} asked for</p>
            <div className="ag-services">
              {client.needs.map((id) => (
                <span key={id} className="svc">
                  {serviceTitle(id)}
                </span>
              ))}
            </div>
            <div className="bc-lines ag-terms">
              <p className="bc-line">
                <span className="bc-line-label">Hours</span>
                <span className="bc-line-value">{client.hours} h/week</span>
              </p>
              <p className="bc-line">
                <span className="bc-line-label">Pattern</span>
                <span className="bc-line-value">{client.schedule}</span>
              </p>
            </div>
            <div className="panel-card-actions">
              <Button variant="primary" onClick={() => setModal('agreement')}>
                <FileText size={14} strokeWidth={1.75} />
                Set up agreement
              </Button>
            </div>
          </>
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

      {/* An outstanding work order is a fact about this family, so it belongs on
          the overview. Filling it in is a form, so it does not. */}
      {due && (
        <Section
          title="Work order outstanding"
          badge={
            <span className={`status-pill is-${client.dueInHours <= 6 ? 'declined' : 'pending'}`}>
              <Clock size={12} strokeWidth={2} />
              {client.dueInHours} h left
            </span>
          }
        >
          <p className="ag-lead">
            {due.date} · {due.time} — {due.hours} h at the agreed {money(client.rate)}/h. It charges
            itself after 24 hours, so send it with the hours and the report that actually happened.
          </p>
          <div className="bc-lines ag-terms">
            <p className="bc-line">
              <span className="bc-line-label">If sent as planned</span>
              <span className="bc-line-value">
                {money(totalsFor(due.hours, client.rate).net)} to you
              </span>
            </p>
          </div>
          <div className="panel-card-actions">
            <Button variant="primary" onClick={() => setModal('work-order')}>
              <FileText size={14} strokeWidth={1.75} />
              Fill in work order
            </Button>
          </div>
        </Section>
      )}

      <Section title="Visits">
        <Visits client={client} />
      </Section>

      <Section title="Activity">
        <Activity client={client} />
      </Section>

      <AnimatePresence>
        {modal === 'agreement' && (
          <Modal
            key="agreement"
            eyebrow={client.elder}
            title="Care agreement"
            wide
            onClose={() => setModal(null)}
          >
            <AgreementForm
              client={client}
              onSend={(id, terms) => {
                setModal(null);
                onSendAgreement(id, terms);
              }}
              onCancel={() => setModal(null)}
            />
          </Modal>
        )}

        {modal === 'work-order' && due && (
          <Modal
            key="work-order"
            eyebrow={client.elder}
            title="Work order"
            wide
            onClose={() => setModal(null)}
          >
            <WorkOrderForm
              client={client}
              visit={due}
              onSend={(id, report) => {
                setModal(null);
                onSendWorkOrder(id, report);
              }}
              onCancel={() => setModal(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
