import { useState } from 'react';
import { Check } from 'lucide-react';
import Button from '../components/Button';
import AskAssistant from '../components/AskAssistant';

function Toggle({ label, hint, on, onChange }) {
  return (
    <button
      type="button"
      className="toggle-row"
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <span className="toggle-text">
        <span className="tip-title">{label}</span>
        <span className="tip-body">{hint}</span>
      </span>
      <span className={`switch${on ? ' is-on' : ''}`}>
        <span className="switch-knob" />
      </span>
    </button>
  );
}

export default function Settings({ unlocked, onAskAssistant }) {
  const [prefs, setPrefs] = useState({
    replies: true,
    schedule: true,
    digest: false,
    marketing: false,
  });
  const set = (key) => (v) => setPrefs((p) => ({ ...p, [key]: v }));

  return (
    <div className="view">
      <div className="view-head">
        <div className="view-head-text">
          <h1 className="view-title">Settings</h1>
          <p className="view-sub">Notifications, subscription and account.</p>
        </div>
        <AskAssistant onClick={onAskAssistant} />
      </div>

      <div className="panel-card">
        <p className="doc-section-title">Notifications</p>
        <div className="toggle-list">
          <Toggle
            label="Caregiver replies"
            hint="When someone accepts or declines your request"
            on={prefs.replies}
            onChange={set('replies')}
          />
          <Toggle
            label="Schedule changes"
            hint="Cancelled or rescheduled visits"
            on={prefs.schedule}
            onChange={set('schedule')}
          />
          <Toggle
            label="Weekly digest"
            hint="A Sunday summary of the week's visits"
            on={prefs.digest}
            onChange={set('digest')}
          />
          <Toggle
            label="Product news"
            hint="Occasional updates about NANA Prime"
            on={prefs.marketing}
            onChange={set('marketing')}
          />
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-head">
          <p className="doc-section-title">Subscription</p>
          <span className={`status-pill is-${unlocked ? 'accepted' : 'muted'}`}>
            {unlocked ? 'Active' : 'Not subscribed'}
          </span>
        </div>
        {unlocked ? (
          <>
            <ul className="paywall-list">
              <li>
                <Check size={12} strokeWidth={2.5} /> Caregiver contact details
              </li>
              <li>
                <Check size={12} strokeWidth={2.5} /> Doctor & equipment recommendations
              </li>
            </ul>
            <p className="tip-body">1.490 RSD / month · renews 4 September 2026</p>
            <div className="panel-card-actions">
              <Button variant="secondary">Manage billing</Button>
            </div>
          </>
        ) : (
          <p className="tip-body">
            Subscribe from the care plan to unlock caregiver numbers and the full
            recommendations.
          </p>
        )}
      </div>

      <div className="panel-card">
        <p className="doc-section-title">Account</p>
        <p className="tip-body">
          Export everything we hold about you, or close the account and delete it.
        </p>
        <div className="panel-card-actions">
          <Button variant="secondary">Export my data</Button>
          <Button variant="ghost">Delete account</Button>
        </div>
      </div>
    </div>
  );
}
