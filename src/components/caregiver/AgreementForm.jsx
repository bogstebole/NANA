import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import Button from '../Button';
import { DEFAULT_RATE, SERVICES, money, totalsFor } from '../../data/caregiverBoard';

// The agreement, the first and only time it is built: which services, and one
// shared hourly rate. Both are pre-filled from what the family actually asked
// for in their request, so the common case is reading it and pressing send
// rather than composing it from nothing.
export default function AgreementForm({ client, onSend, onCancel }) {
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
        This sets out which services you provide and one shared hourly rate. Everything after it —
        visits, work orders, payments — is calculated from it.
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
          At {client.hours} h a week that is {money(weekly)} a week,{' '}
          {money(totalsFor(client.hours, rateNumber).net)} to you after the 10% service fee.
        </p>
      )}

      <div className="panel-card-actions is-end">
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
