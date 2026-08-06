import { useState } from 'react';
import { Mail, MessageCircle, Phone, Plus } from 'lucide-react';
import Button from './Button';

// Two blocks the client's document ends on. Both are the same idea: the plan is not
// a finished document handed down, it is a conversation the family can push back on.

// "Ukoliko želite da postavite neko dodatno pitanje ili prilagodite neki segment
// plana, slobodno ovde upišite" — the plan takes additions from the family.
export function PlanAsk({ onAdd }) {
  const [text, setText] = useState('');
  const [added, setAdded] = useState([]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    setAdded((a) => [...a, value]);
    setText('');
    onAdd?.(value);
  };

  return (
    <div className="plan-ask">
      <p className="rec-title">Anything you’d like to add or change?</p>
      <p className="doc-p">
        If you want to ask something, or adjust part of this plan, write it here and I’ll pick it
        up.
      </p>

      {added.map((a, i) => (
        <p className="plan-ask-added" key={i}>
          <Plus size={13} strokeWidth={2} /> {a}
        </p>
      ))}

      <div className="plan-ask-row">
        <input
          type="text"
          value={text}
          placeholder="Could we start with mornings only?"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <Button variant="secondary" disabled={!text.trim()} onClick={submit}>
          <Plus size={13} strokeWidth={2} /> Add to my plan
        </Button>
      </div>
    </div>
  );
}

// "Od sada ne morate sve sami da organizujete." Reaching the coordinator is never
// behind the paywall — the paywall is on caregiver numbers.
export function CoordinatorContact({ coordinator }) {
  return (
    <div className="coordinator-contact">
      <p className="rec-title">If you’d like to reach {coordinator.name.split(' ')[0]} directly</p>
      <div className="contact-rows">
        <a className="contact-row" href={`https://wa.me/${coordinator.whatsapp.replace(/\D/g, '')}`}>
          <MessageCircle size={14} strokeWidth={1.75} />
          <span className="contact-label">WhatsApp</span>
          <span className="contact-value">{coordinator.whatsapp}</span>
        </a>
        <a className="contact-row" href={`tel:${coordinator.phone.replace(/\s/g, '')}`}>
          <Phone size={14} strokeWidth={1.75} />
          <span className="contact-label">Phone</span>
          <span className="contact-value">{coordinator.phone}</span>
        </a>
        <a className="contact-row" href={`mailto:${coordinator.email}`}>
          <Mail size={14} strokeWidth={1.75} />
          <span className="contact-label">Email</span>
          <span className="contact-value">{coordinator.email}</span>
        </a>
      </div>
      <p className="contact-note">
        From here on you don’t have to organise all of this yourself. Whenever you need a hand,
        call me.
      </p>
    </div>
  );
}
