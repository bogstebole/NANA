import { motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
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

// Opened from the care plan preview. Two things sit behind the paywall here: the
// caregivers' numbers (tap a caregiver) and every recommendation section.
export default function CaregiverSidebar({ plan, unlocked, onSelectCaregiver, onUnlock, onClose }) {
  return (
    <motion.div
      className="sidebar-wrap"
      initial={{ width: 0 }}
      animate={{ width: 432 }}
      exit={{ width: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
    >
      <div className="sidebar">
        <div className="sidebar-head">
          <div>
            <p className="doc-eyebrow">Care plan</p>
            <p className="doc-title">Care plan for {plan.name}</p>
          </div>
          <button type="button" className="ci-btn" onClick={onClose} aria-label="Close panel">
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="sidebar-body">
          <p className="doc-section-title">
            Matched caregivers <span className="doc-count">{caregivers.length}</span>
          </p>
          <p className="doc-p">
            Ranked by how well they fit {plan.firstName}’s schedule, tasks and location.
            {!unlocked && ' Tap a caregiver to request their number.'}
          </p>

          {caregiversFor(unlocked).map((c) => (
            <CaregiverRow key={c.id} caregiver={c} onSelect={onSelectCaregiver} detailed />
          ))}

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
                  safer — plus the direct number of every caregiver above.
                </p>
                <Button variant="primary" size="lg" onClick={onUnlock}>
                  <Lock size={12} strokeWidth={2} /> Subscribe to see the full plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
