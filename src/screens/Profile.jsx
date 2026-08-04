import { Pencil } from 'lucide-react';
import { questionById } from '../data/flow';
import Button from '../components/Button';

// Reads straight from the questionnaire answers, so the profile is whatever the
// user told the assistant — no second source of truth.
function fieldsOf(questionId, answers) {
  const q = questionById[questionId];
  const values = answers[questionId]?.values;
  if (!q?.fields || !values) return [];
  return q.fields.map((f) => ({ label: f.label, value: values[f.id] || '—' }));
}

function Section({ title, rows, onEdit }) {
  return (
    <div className="panel-card">
      <div className="panel-card-head">
        <p className="doc-section-title">{title}</p>
        {onEdit && (
          <Button variant="secondary" iconOnly aria-label={`Edit ${title}`} onClick={onEdit}>
            <Pencil size={14} strokeWidth={1.75} />
          </Button>
        )}
      </div>
      <div className="facts">
        {rows.map((r) => (
          <div className="fact" key={r.label}>
            <span className="fact-label">{r.label}</span>
            <span className="fact-value">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Profile({ user, answers, onGoToChat }) {
  const elderly = fieldsOf('basic-info', answers);
  const contact = fieldsOf('primary-contact', answers);
  const doctor = fieldsOf('doctor-info', answers);

  return (
    <div className="view">
      <div className="view-head">
        <h1 className="view-title">Profile</h1>
        <p className="view-sub">Everything you’ve shared, in one place.</p>
      </div>

      <Section
        title="Your account"
        rows={[
          { label: 'Name', value: user.name || '—' },
          { label: 'Email', value: user.email || '—' },
        ]}
      />

      {elderly.length > 0 ? (
        <>
          <Section title="Care recipient" rows={elderly} onEdit={onGoToChat} />
          {contact.length > 0 && (
            <Section title="Emergency contact" rows={contact} onEdit={onGoToChat} />
          )}
          {doctor.length > 0 && <Section title="Doctor" rows={doctor} onEdit={onGoToChat} />}
        </>
      ) : (
        <div className="empty">
          <p className="locked-title">Nothing here yet</p>
          <p className="locked-note">
            Answer the questions in the chat and the profile fills itself in.
          </p>
          <Button variant="primary" onClick={onGoToChat}>
            Go to the chat
          </Button>
        </div>
      )}
    </div>
  );
}
