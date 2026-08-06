import { ArrowUpRight, FileText } from 'lucide-react';
import { caregiversFor, caregivers } from '../data/carePlan';
import CaregiverRow from './CaregiverRow';
import Button from './Button';

const today = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

// The care plan as it appears inside the chat: a grey container holding a white
// "document". It shows the summary and the top matches; the rest of the plan lives
// in the side panel, and the whole card reads as one open-me target.
export default function CarePlanCard({ plan, unlocked, onOpen, onSelectCaregiver }) {
  const preview = caregiversFor(unlocked).slice(0, 2);

  return (
    <div className="workflow-card care-plan">
      <div
        className="doc"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        <div className="doc-head">
          <FileText size={14} strokeWidth={1.75} className="doc-icon" />
          <div className="doc-head-text">
            <p className="doc-eyebrow">
              Care plan <span className="doc-meta">· {today}</span>
            </p>
            <p className="doc-title">Care plan for {plan.name}</p>
          </div>
          <span className="doc-open">
            Open <ArrowUpRight size={12} strokeWidth={2} />
          </span>
        </div>

        {plan.narrative.map((p, i) => (
          <p className="doc-p" key={i}>
            {p}
          </p>
        ))}

        <div className="facts">
          {plan.facts.map((f) => (
            <div className="fact" key={f.label}>
              <span className="fact-label">{f.label}</span>
              <span className="fact-value">{f.value}</span>
            </div>
          ))}
        </div>

        <p className="doc-section-title">
          Top matches <span className="doc-count">of {caregivers.length}</span>
        </p>
        {preview.map((c) => (
          <CaregiverRow key={c.id} caregiver={c} onSelect={onSelectCaregiver} />
        ))}

        <div className="doc-more-cta">
          <Button
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            Open full care plan <ArrowUpRight size={12} strokeWidth={2} />
          </Button>
          <span className="doc-cta-note">
            Jovana’s message · {plan.recommendations.length} recommendations ·{' '}
            {caregivers.length} caregivers
          </span>
        </div>
      </div>
    </div>
  );
}
