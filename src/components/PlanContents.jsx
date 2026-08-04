import { Lock } from 'lucide-react';
import { caregivers, caregiversFor, equipment, medicalTips } from '../data/carePlan';
import CaregiverRow from './CaregiverRow';
import Button from './Button';

function Tips({ items }) {
  return (
    <div className="doc-tips">
      {items.map((t) => (
        <div className="tip" key={t.title}>
          <p className="tip-title">{t.title}</p>
          <p className="tip-body">{t.body}</p>
        </div>
      ))}
    </div>
  );
}

// The body of a care plan — matched caregivers and the recommendations behind the
// paywall. Shared by the side panel and the full page so they never drift apart.
export default function PlanContents({ plan, unlocked, onSelectCaregiver, onUnlock, archived }) {
  return (
    <>
      <p className="doc-section-title">
        Matched caregivers <span className="doc-count">{plan.caregiverCount ?? caregivers.length}</span>
      </p>

      {archived ? (
        <p className="doc-p">
          {plan.caregiverCount} caregivers were matched to this plan. Contact details are only kept
          for the active plan.
        </p>
      ) : (
        <>
          <p className="doc-p">
            Ranked by how well they fit {plan.firstName}’s schedule, tasks and location.
            {!unlocked && ' Tap a caregiver to request their number.'}
          </p>
          {caregiversFor(unlocked).map((c) => (
            <CaregiverRow key={c.id} caregiver={c} onSelect={onSelectCaregiver} detailed />
          ))}
        </>
      )}

      {/* The section heading stays readable so it is obvious what is being withheld;
          the advice itself is blurred out under a white gradient with the CTA on top. */}
      <p className="doc-section-title">Doctor & medical recommendations</p>

      {unlocked ? (
        <>
          <Tips items={medicalTips} />
          <p className="doc-section-title">Suggested aids & equipment</p>
          <Tips items={equipment} />
        </>
      ) : (
        <div className="locked-region">
          <div className="locked-content" aria-hidden="true">
            <Tips items={medicalTips} />
            <p className="doc-section-title">Suggested aids & equipment</p>
            <Tips items={equipment} />
          </div>
          <div className="locked-overlay">
            <span className="locked-badge">
              <Lock size={14} strokeWidth={2} />
            </span>
            <p className="locked-title">Recommendations are part of the full plan</p>
            <p className="locked-note">
              Which doctor visits to book for {plan.firstName}, and the aids that make the flat
              safer{archived ? '.' : ' — plus the direct number of every caregiver above.'}
            </p>
            <Button variant="primary" size="lg" onClick={onUnlock}>
              <Lock size={12} strokeWidth={2} /> Subscribe to see the full plan
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
