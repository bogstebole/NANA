import { useState } from 'react';
import { CalendarClock, Check } from 'lucide-react';
import Button from '../Button';
import { hoursIn, money, serviceTitle, totalsFor } from '../../data/caregiverBoard';

// The visit order: what is meant to happen, written before going. It sits
// between the agreement and the work order and is the reason those two can be
// compared at all — without it, "4 hours worked" is a number with nothing to be
// measured against, and the things to remember on the way live in someone's
// head.
//
// It is filled from the agreement: the pattern gives the time, the time gives
// the hours, and the services are the ones the agreement covers.
export default function VisitPlanForm({ client, plan, onSave, onCancel }) {
  const patternTime = client.schedule?.split('· ')[1] || '';
  const [date, setDate] = useState(plan?.date || '');
  const [time, setTime] = useState(plan?.time || patternTime);
  const [services, setServices] = useState(plan?.services || client.services);
  const [notes, setNotes] = useState(plan?.notes || '');

  const hours = hoursIn(time);
  const valid = date.trim().length > 0 && hours > 0;

  const toggle = (id) =>
    setServices((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <p className="ag-lead">
        What you are going to {client.elder.split(' ')[0]} for. The work order afterwards opens
        against this, so anything you change here is what you will be comparing the visit to.
      </p>

      <div className="wo-row">
        <label className="wo-field is-wide">
          <span className="ag-label">Day</span>
          <input
            type="text"
            className="wo-text"
            value={date}
            placeholder="Thursday 14 August"
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="wo-field">
          <span className="ag-label">Time</span>
          <input
            type="text"
            className="wo-text is-time"
            value={time}
            placeholder="09:00–13:00"
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>
      <p className="ag-hint">
        {hours
          ? `${hours} h at the agreed ${money(client.rate)}/h — ${money(
              totalsFor(hours, client.rate).net
            )} to you if it runs to plan. The pattern in the agreement is ${client.schedule}.`
          : `Times as a range, like 09:00–13:00. The pattern in the agreement is ${client.schedule}.`}
      </p>

      <p className="ag-label">What you plan to do</p>
      <div className="ag-services">
        {client.services.map((id) => (
          <button
            key={id}
            type="button"
            className={`svc${services.includes(id) ? ' is-on' : ''}`}
            onClick={() => toggle(id)}
            aria-pressed={services.includes(id)}
          >
            {services.includes(id) && <Check size={13} strokeWidth={2.5} />}
            {serviceTitle(id)}
          </button>
        ))}
      </div>

      <label className="wo-field">
        <span className="ag-label">Anything to remember</span>
        <textarea
          rows={2}
          className="wo-text"
          value={notes}
          placeholder="A prescription to collect, something the family asked for, something to check on."
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div className="panel-card-actions is-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          onClick={() =>
            onSave(client.id, { date: date.trim(), time: time.trim(), hours, services, notes: notes.trim() })
          }
        >
          <CalendarClock size={14} strokeWidth={1.75} />
          {plan ? 'Save the plan' : 'Plan the visit'}
        </Button>
      </div>
    </>
  );
}
