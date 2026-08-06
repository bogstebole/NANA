import { Lock } from 'lucide-react';
import { caregivers, caregiversFor, coordinator } from '../data/carePlan';
import CoordinatorMessage from './CoordinatorMessage';
import RecommendationCard from './RecommendationCard';
import { CoordinatorContact, PlanAsk } from './PlanFooterBlocks';
import CaregiverRow from './CaregiverRow';
import Button from './Button';

// The body of a care plan, in the order the client's document lays it out: the
// coordinator's letter, then the recommendations — each saying why it is being
// recommended for this person — then the full caregiver list, then the two ways the
// family can push back on the plan. Shared by the side panel and the full page so
// they never drift apart.
export default function PlanContents({ plan, unlocked, onSelectCaregiver, onUnlock, archived }) {
  const open = (plan.recommendations || []).filter((r) => !r.locked);
  const locked = (plan.recommendations || []).filter((r) => r.locked);

  return (
    <>
      {plan.letter && <CoordinatorMessage letter={plan.letter} />}

      <p className="doc-section-title">What we recommend</p>

      {open.map((rec) => (
        <RecommendationCard
          key={rec.id}
          rec={rec}
          unlocked={unlocked}
          onSelectCaregiver={onSelectCaregiver}
        />
      ))}

      {/* Everything else in the plan is written and ready; the subscription is what
          opens it, along with the caregivers' numbers. The heading stays readable so
          it is obvious what is being withheld. */}
      {unlocked ? (
        locked.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} unlocked onSelectCaregiver={onSelectCaregiver} />
        ))
      ) : (
        <div className="locked-region">
          <div className="locked-content" aria-hidden="true">
            {locked.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} unlocked={false} />
            ))}
          </div>
          <div className="locked-overlay">
            <span className="locked-badge">
              <Lock size={14} strokeWidth={2} />
            </span>
            <p className="locked-title">
              {locked.length} more recommendations in the full plan
            </p>
            <p className="locked-note">
              Which doctor visits to book for {plan.firstName}, the changes that make the flat
              safer, and what there is nearby
              {archived ? '.' : ' — plus the direct number of every caregiver.'}
            </p>
            <Button variant="primary" size="lg" onClick={onUnlock}>
              <Lock size={12} strokeWidth={2} /> Subscribe to see the full plan
            </Button>
          </div>
        </div>
      )}

      <p className="doc-section-title">
        Everyone we matched{' '}
        <span className="doc-count">{plan.caregiverCount ?? caregivers.length}</span>
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

      {!archived && (
        <>
          <PlanAsk />
          <CoordinatorContact coordinator={plan.coordinator || coordinator} />
        </>
      )}
    </>
  );
}
