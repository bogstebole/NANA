import { RefreshCw } from 'lucide-react';

// Shown after an edit actually moved the frailty level: says plainly what was
// dropped and what is being asked instead, so the reopened questions further down
// the thread are never a surprise.
export default function FlowChangeNotice({ change, name }) {
  const { dropped, added, level, previousLevel } = change;

  return (
    <div className="flow-change">
      <RefreshCw size={14} strokeWidth={2} className="flow-change-icon" />
      <div className="flow-change-text">
        <p className="flow-change-title">
          That changed the picture — {name} now looks like level {level}, not {previousLevel}
        </p>
        {dropped.length > 0 && (
          <p className="flow-change-note">
            {dropped.length === 1 ? 'This answer no longer applies' : 'These answers no longer apply'}
            , so I’ve set {dropped.length === 1 ? 'it' : 'them'} aside:{' '}
            <strong>{dropped.map((q) => q.shortTitle).join(', ')}</strong>.
          </p>
        )}
        {added.length > 0 && (
          <p className="flow-change-note">
            I need to ask you {added.length} thing{added.length === 1 ? '' : 's'} instead:{' '}
            <strong>{added.map((q) => q.shortTitle).join(', ')}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
