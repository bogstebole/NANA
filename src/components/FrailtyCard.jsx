import { Activity } from 'lucide-react';
import { CFS } from '../data/frailty';

const LEVELS = Object.keys(CFS).map(Number);

// The milestone the client's flow turns on: once daily life is described, the
// assistant states where the person sits on the frailty scale before it asks
// anything else. It is an estimate from the answers, and says so.
const EN = {
  eyebrow: 'Frailty assessment',
  title: (name, f) => `${name} looks like level ${f.level} — ${f.label}`,
  note: 'Estimated from your answers on the Clinical Frailty Scale, and used to decide what we ask next. It’s a summary of what you told us, not a diagnosis.',
};

export const SR = {
  eyebrow: 'Procena krhkosti',
  title: (name, f) => `${name} je oko nivoa ${f.level} — ${f.label.toLowerCase()}`,
  note: 'Procenjeno iz vaših odgovora, po Kliničkoj skali krhkosti, i koristi se da odlučimo šta dalje da pitamo. To je sažetak onoga što ste nam rekli, a ne dijagnoza.',
};

export default function FrailtyCard({ frailty, name, copy = EN }) {
  return (
    <div className="workflow-card care-plan">
      <div className="doc is-static">
        <div className="doc-head">
          <Activity size={14} strokeWidth={1.75} className="doc-icon" />
          <div className="doc-head-text">
            <p className="doc-eyebrow">{copy.eyebrow}</p>
            <p className="doc-title">{copy.title(name, frailty)}</p>
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

        <p className="cfs-note">{copy.note}</p>
      </div>
    </div>
  );
}
