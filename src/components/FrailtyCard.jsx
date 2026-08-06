import { Activity } from 'lucide-react';
import { CFS } from '../data/frailty';

const LEVELS = Object.keys(CFS).map(Number);

// The milestone the client's flow turns on: once daily life is described, the
// assistant states where the person sits on the frailty scale before it asks
// anything else. It is an estimate from the answers, and says so.
export default function FrailtyCard({ frailty, name }) {
  return (
    <div className="workflow-card care-plan">
      <div className="doc is-static">
        <div className="doc-head">
          <Activity size={14} strokeWidth={1.75} className="doc-icon" />
          <div className="doc-head-text">
            <p className="doc-eyebrow">Frailty assessment</p>
            <p className="doc-title">
              {name} looks like level {frailty.level} — {frailty.label}
            </p>
          </div>
        </div>

        <p className="doc-p">{frailty.blurb}</p>

        <div className="cfs-scale" role="img" aria-label={`Level ${frailty.level} of 9`}>
          {LEVELS.map((l) => (
            <span
              key={l}
              className={`cfs-step${l === frailty.level ? ' is-current' : ''}${
                l < frailty.level ? ' is-passed' : ''
              }`}
            >
              {l}
            </span>
          ))}
        </div>

        <p className="cfs-note">
          Estimated from your answers on the Clinical Frailty Scale, and used to decide
          what we ask next. It’s a summary of what you told us, not a diagnosis.
        </p>
      </div>
    </div>
  );
}
