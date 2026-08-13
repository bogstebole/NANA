import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User, X } from 'lucide-react';

// How well Jovana understands the person being described, shown as a portrait
// coming into focus rather than a bar filling up.
//
// A bar was the wrong promise: it says "n of m questions", and there is no m —
// what gets asked depends on what the last answer opened up. What there *is* is
// Jovana's own reading of how much of this person she can see, which she reports
// every turn through `assess`. So the thing on screen is her sight: a lens that
// sharpens, what she already knows written out beside it, and what she is still
// missing sitting there out of focus.
//
// The number can fall. When someone mentions dementia in passing, the picture
// genuinely got less clear, and hiding that to keep a bar monotonic would be the
// one dishonest pixel on the screen.

const R = 45;
const CIRCUMFERENCE = 2 * Math.PI * R;

// Named bands rather than a percentage. A percent invites arithmetic on a
// judgement — "why 64 and not 70" has no answer worth giving.
const BANDS = [
  { under: 25, word: 'Još je ne poznajem' },
  { under: 50, word: 'Upoznajemo se' },
  { under: 75, word: 'Slika se sklapa' },
  { under: 92, word: 'Skoro je jasno' },
  { under: Infinity, word: 'Znam dovoljno' },
];
const wordFor = (level) => BANDS.find((b) => level < b.under).word;

const things = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'stvar' : 'stvari');

const chip = {
  initial: { opacity: 0, y: 6, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] } },
  exit: { opacity: 0, filter: 'blur(4px)', transition: { duration: 0.25 } },
};

function Known({ facts }) {
  return (
    <AnimatePresence initial={false}>
      {facts.map((f) => (
        <motion.li
          key={f.id}
          className={`imm-know-chip${f.note ? ' is-note' : ''}`}
          variants={chip}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
        >
          {f.text}
        </motion.li>
      ))}
    </AnimatePresence>
  );
}

// The gaps are drawn as chips too, and deliberately the same shape as the known
// ones — they are the same picture, just the part of it that has not resolved.
function Missing({ unknowns, done }) {
  return (
    <AnimatePresence initial={false}>
      {unknowns.map((u) => (
        <motion.li
          key={u}
          className={`imm-know-chip ${done ? 'is-watch' : 'is-missing'}`}
          variants={chip}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
        >
          {u}
        </motion.li>
      ))}
    </AnimatePresence>
  );
}

export default function UnderstandingPanel({ level = 0, reason, unknowns = [], facts = [], name, dropped, done }) {
  const [open, setOpen] = useState(false);

  // The lens carries the reading twice: the ring measures it, the focus is felt.
  // Never fully sharp below 100 — a crisp portrait at 80 would say "done".
  const blur = ((100 - level) / 100) * 5;

  return (
    <motion.div
      className={`imm-know${open ? ' is-open' : ''}${dropped ? ' is-dropped' : ''}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.4 } }}
      layout
    >
      <button
        type="button"
        className="imm-know-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Koliko vas Jovana razume: ${wordFor(level)}. ${open ? 'Sakrij' : 'Prikaži'} detalje.`}
      >
        <span className="imm-know-lens" role="img" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="imm-know-ring">
            <circle className="imm-know-ring-track" cx="50" cy="50" r={R} />
            <motion.circle
              className="imm-know-ring-fill"
              cx="50"
              cy="50"
              r={R}
              strokeDasharray={CIRCUMFERENCE}
              transform="rotate(-90 50 50)"
              initial={false}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - level / 100) }}
              transition={{ type: 'spring', stiffness: 55, damping: 18 }}
            />
          </svg>
          <span className="imm-know-face" style={{ filter: `blur(${blur.toFixed(2)}px)` }}>
            {name ? name.charAt(0).toUpperCase() : <User size={18} strokeWidth={1.5} />}
          </span>
        </span>
        <span className="imm-know-head-text">
          <span className="imm-know-word">{wordFor(level)}</span>
          <span className="imm-know-who">{name || 'osobu o kojoj brinete'}</span>
        </span>
        {open && <X size={14} strokeWidth={1.75} className="imm-know-close" />}
      </button>

      {/* Jovana's own sentence is the only explanation of the ring anyone gets,
          so it stays visible collapsed — the lists are what folds away. */}
      <AnimatePresence mode="wait">
        {reason && (
          <motion.p
            key={reason}
            className="imm-know-reason"
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {reason}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dropped && (
          <motion.p
            className="imm-know-drop"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            otvorilo se novo pitanje
          </motion.p>
        )}
      </AnimatePresence>

      {/* Collapsed, only the gaps are listed. The question this panel answers is
          "how much is left", and what she already knows is reassurance, not an
          answer — it belongs one click away. Showing both at once also meant
          three kinds of chip in one column with nothing to tell them apart.
          Open, both lists are here in full and each one is named. */}
      <div className="imm-know-lists">
        {open && facts.length > 0 && (
          <>
            <p className="imm-know-label">Šta znam</p>
            <ul className="imm-know-chips">
              <Known facts={facts} />
            </ul>
          </>
        )}

        {/* Once the plan exists, a leftover gap is not a gap any more. Deleting
            these would be the easy fix and the false one — the model really is
            still unsure how she takes to a stranger in the house, and the plan
            itself says the level gets revisited. So they stay, renamed: open
            questions to watch, not answers the plan is missing. */}
        {unknowns.length > 0 && (
          <>
            <p className="imm-know-label">{done ? 'Ostaje da se vidi' : 'Šta mi još fali'}</p>
            <ul className="imm-know-chips">
              <Missing unknowns={unknowns} done={done} />
            </ul>
          </>
        )}

        {/* The count is the only thing left of a progress number, and it counts
            up honestly — nothing here ever drops out of the list. */}
        {!open && facts.length > 0 && (
          <button type="button" className="imm-know-more" onClick={() => setOpen(true)}>
            Znam već {facts.length} {things(facts.length)} o njoj
          </button>
        )}
      </div>
    </motion.div>
  );
}
