import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUp, ArrowUpRight, LayoutList, Volume2, VolumeX } from 'lucide-react';
import { questionById } from '../data/flow';
import { frailtyOf } from '../data/frailty';
import { remainingQuestions, systemPrompt } from '../data/conversation';
import { Q, CFS_SR, STARTERS, SECTION } from '../data/flow.sr';
import { buildPlan, caregivers } from '../data/carePlan';
import { createClient, runTurn } from '../lib/claudeChat';
import CloudBackground from '../components/immersive/CloudBackground';
import { createZenAudio } from '../lib/zenAudio';
import Button from '../components/Button';

const letterFor = (i) => String.fromCharCode(97 + i);

const EASE_OUT = [0.22, 0.61, 0.36, 1];
const EASE_IN = [0.55, 0.06, 0.68, 0.19];

const screen = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.065, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.035, staggerDirection: -1 } },
};
const piece = {
  initial: { opacity: 0, y: 20, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { opacity: 0, y: -12, scale: 1.01, transition: { duration: 0.3, ease: EASE_IN } },
};
const list = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.055 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

// Jovana's line arrives token by token, so it is rendered word by word: each one
// resolves out of a blur instead of the whole paragraph snapping into place.
// Keyed by index so a word already on screen never re-animates as the next
// token extends the string.
function Streamed({ text }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="imm-word"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          {word}
          {i < words.length - 1 ? '\u00a0' : ''}
        </motion.span>
      ))}
    </>
  );
}

// One composer for everything typed, instead of a field per question. It is
// always there, so the cards read as a shortcut rather than the only way through
// — and the questions that used to be three stacked input cards are now just
// answered in a sentence, which Jovana pulls the fields out of.
function Composer({ placeholder, autoFocus, suggestions = [], onSend }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus({ preventScroll: true }), 650);
  }, [autoFocus]);

  const send = () => {
    const t = value.trim();
    if (t) {
      setValue('');
      onSend(t);
    }
  };

  return (
    <div className="imm-composer-wrap">
      {suggestions.length > 0 && (
        <div className="imm-suggestions">
          {suggestions.slice(0, 4).map((sug) => (
            <button key={sug} type="button" className="imm-suggestion" onClick={() => onSend(sug)}>
              {sug}
            </button>
          ))}
        </div>
      )}
      <div className="imm-composer">
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button type="button" className="imm-send" disabled={!value.trim()} onClick={send} aria-label="Pošalji">
          <ArrowUp size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Cards({ question, onPick }) {
  const sr = Q[question.id] || {};
  const [ids, setIds] = useState([]);
  const [values, setValues] = useState({});

  // `inputs` questions render nothing. Three stacked field cards were the last
  // piece of questionnaire left in here; the person answers in a sentence and
  // Jovana maps it onto the fields.
  if (question.type === 'inputs') return null;

  const label = (o) => sr.options?.[o.id] || o.title;

  if (question.type === 'single') {
    return (
      <motion.div className="imm-options" variants={list}>
        {question.options.map((o, i) => (
          <motion.button
            key={o.id}
            type="button"
            variants={piece}
            whileHover={{ y: -1 }}
            className="imm-option"
            onClick={() => onPick({ optionId: o.id }, label(o))}
          >
            <span className="imm-letter">{letterFor(i)}</span>
            <span className="imm-option-text">
              <span className="imm-option-title">{label(o)}</span>
            </span>
          </motion.button>
        ))}
      </motion.div>
    );
  }

  const empty = ids.length === 0;
  return (
    <>
      <motion.div className="imm-options" variants={list}>
        {question.options.map((o, i) => (
          <motion.button
            key={o.id}
            type="button"
            variants={piece}
            whileHover={{ y: -1 }}
            className={`imm-option${ids.includes(o.id) ? ' is-selected' : ''}`}
            onClick={() => setIds((p) => (p.includes(o.id) ? p.filter((x) => x !== o.id) : [...p, o.id]))}
          >
            <span className="imm-letter">{letterFor(i)}</span>
            <span className="imm-option-text">
              <span className="imm-option-title">{label(o)}</span>
            </span>
          </motion.button>
        ))}
      </motion.div>
      <motion.div className="imm-actions" variants={piece}>
        <Button
          variant="primary"
          size="lg"
          disabled={!question.allowEmpty && empty}
          onClick={() =>
            onPick(
              { optionIds: ids },
              question.options.filter((o) => ids.includes(o.id)).map(label).join(', ') ||
                sr.empty ||
                'Ništa od toga'
            )
          }
        >
          {question.allowEmpty && empty ? sr.empty || 'Ništa od toga' : 'Dalje'}
        </Button>
      </motion.div>
    </>
  );
}

// The AI conversation in the immersive form: one screen at a time over the
// clouds, but the question on each screen is written by Jovana rather than read
// off a list — and the first screen is a blank page, not a question.
export default function ImmersiveConversation({
  user,
  answers,
  onAnswer,
  notes,
  onNote,
  apiKey,
  onPlan,
  onExit,
  onFinish,
}) {
  const [stage, setStage] = useState('open'); // open | asking | plan
  const [said, setSaid] = useState('');
  const [draft, setDraft] = useState('');
  const [asked, setAsked] = useState(null);
  const [followUp, setFollowUp] = useState(null); // string[] of suggestions
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [muted, setMuted] = useState(false);
  const history = useRef([]);
  const audioRef = useRef(null);

  const client = useMemo(() => createClient(apiKey), [apiKey]);
  const system = useMemo(() => systemPrompt(user), [user]);

  const frailty = frailtyOf(answers);
  const remaining = remainingQuestions(answers);
  const answered = Object.keys(answers).length;
  // The bar tracks data actually collected, which is real. The old "još 12"
  // counted only questions from the list, so a `follow_up` screen froze it while
  // screens went by — a number the flow cannot honour is worse than none.
  const progress = answered + remaining.length ? answered / (answered + remaining.length) : 0;
  const planName = answers['about-person']?.values?.name?.trim().split(' ')[0] || 'nju';

  useEffect(() => {
    const audio = createZenAudio();
    audio.start();
    audioRef.current = audio;
    return () => audio.stop();
  }, []);

  const turn = useCallback(
    async (text, seed, seedNotes) => {
      history.current.push({ role: 'user', content: text });
      setAsked(null);
      setFollowUp(null);
      setSaid('');
      setDraft('');
      setBusy(true);
      setError(null);

      try {
        const result = await runTurn({
          client,
          system,
          messages: history.current,
          answers: seed,
          notes: seedNotes,
          // The screen shows one line at a time, so text accumulates into a
          // single sentence rather than a transcript.
          onText: (delta) => setSaid((s) => s + delta),
          onAnswer,
          onNote,
          onAsk: (id) => setAsked(id),
          onFollowUp: (suggestions) => setFollowUp(suggestions),
        });
        history.current = result.messages;
        if (!result.messages.some((m) => m.role === 'assistant')) return;
        if (!remainingQuestions(result.answers).length) {
          onPlan(buildPlan(result.answers, result.notes));
          setStage('plan');
        } else {
          setStage('asking');
        }
      } catch (e) {
        setError(e?.message || String(e));
        setStage('asking');
      } finally {
        setBusy(false);
      }
    },
    [client, system, onAnswer, onNote, onPlan]
  );

  const pick = (answer, label) => {
    if (!asked) return;
    onAnswer(asked, answer);
    turn(`(izabrano) ${label}`, { ...answers, [asked]: answer }, notes);
  };

  const question = asked ? questionById[asked] : null;
  const srFrailty =
    frailty && CFS_SR[frailty.level]
      ? { ...frailty, label: CFS_SR[frailty.level].label, blurb: CFS_SR[frailty.level].blurb }
      : frailty;
  const plan = stage === 'plan' ? buildPlan(answers, notes) : null;

  return (
    <motion.div
      className="immersive"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } }}
    >
      <CloudBackground />

      <div className="imm-chrome">
        <div className="imm-progress" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
          <div className="imm-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="imm-ctls">
          <button
            type="button"
            className="imm-ctl"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              audioRef.current?.setMuted(next);
            }}
            aria-label={muted ? 'Uključi zvuk' : 'Isključi zvuk'}
          >
            {muted ? <VolumeX size={15} strokeWidth={1.75} /> : <Volume2 size={15} strokeWidth={1.75} />}
          </button>
          <button type="button" className="imm-ctl" onClick={onExit} aria-label="Klasični prikaz">
            <LayoutList size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="imm-stage">
        <AnimatePresence mode="wait">
          {/* A blank page, not a question. One paragraph here can fill half the
              flow, and it is the only opening that lets someone say the thing the
              question list never thought to ask. */}
          {stage === 'open' && !busy && (
            <motion.div key="open" className="imm-screen" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-count" variants={piece}>
                NANA Prime
              </motion.p>
              <motion.h1 className="imm-title" variants={piece}>
                Recite mi svojim rečima šta se dešava.
              </motion.h1>
              <motion.p className="imm-subtitle" variants={piece}>
                O kome se radi, šta vas brine, šta ste već probali — kako god vam je lakše.
                Ostalo ću pitati usput.
              </motion.p>
              <motion.div className="imm-write" variants={piece}>
                <textarea
                  rows={5}
                  value={draft}
                  placeholder="Majka ima 84 godine i živi sama u Vračaru. Pala je dvaput ove godine…"
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (draft.trim()) turn(draft.trim(), answers, notes);
                    }
                  }}
                />
                <div className="imm-write-actions">
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!draft.trim()}
                    onClick={() => turn(draft.trim(), answers, notes)}
                  >
                    Pošalji
                  </Button>
                </div>
              </motion.div>

              <motion.p className="imm-starters-label" variants={piece}>
                ili krenite od nekog od ovih
              </motion.p>
              <motion.div className="imm-starters" variants={list}>
                {STARTERS.map((s) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    className="imm-starter"
                    variants={piece}
                    whileHover={{ y: -1 }}
                    onClick={() => turn(s.title, answers, notes)}
                  >
                    <span className="imm-starter-text">
                      <span className="imm-starter-title">{s.title}</span>
                      <span className="imm-starter-sub">{s.sub}</span>
                    </span>
                    <ArrowRight size={16} strokeWidth={1.75} className="imm-starter-arrow" />
                  </motion.button>
                ))}
              </motion.div>

              {/* A chat is the wrong channel for an emergency, and saying so is
                  cheap. Better here than discovered at the wrong moment. */}
              <motion.p className="imm-urgent" variants={piece}>
                Ako je hitno — pala je, ne može da diše, ne prepoznaje vas — nemojte pisati meni.
                Zovite <strong>194</strong>.
              </motion.p>
            </motion.div>
          )}

          {busy && (
            <motion.div key="busy" className="imm-screen" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-count" variants={piece}>
                Jovana
              </motion.p>
              <motion.h1 className="imm-title" variants={piece}>
                {said ? <Streamed text={said} /> : '…'}
              </motion.h1>
            </motion.div>
          )}

          {stage === 'asking' && !busy && (question || followUp) && (
            <motion.div
              key={asked || 'follow-up'}
              className="imm-screen"
              variants={screen}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.p className="imm-count" variants={piece}>
                {SECTION[remaining[0]?.sekcija] || 'Skoro gotovo'}
              </motion.p>
              {/* Jovana's own words — the flow's phrasing is never shown. */}
              <motion.h1 className="imm-title" variants={piece}>
                <Streamed text={said} />
              </motion.h1>

              {question && <Cards question={question} onPick={pick} />}

              <motion.div className="imm-composer-slot" variants={piece}>
                <Composer
                  autoFocus={!question || question.type === 'inputs'}
                  suggestions={followUp || []}
                  placeholder={
                    question && question.type !== 'inputs'
                      ? 'ili odgovorite svojim rečima…'
                      : 'Odgovorite svojim rečima…'
                  }
                  onSend={(t) => turn(t, answers, notes)}
                />
              </motion.div>

              {error && <motion.p className="imm-error" variants={piece}>{error}</motion.p>}
            </motion.div>
          )}

          {stage === 'plan' && plan && (
            <motion.div key="plan" className="imm-screen is-wide" variants={screen} initial="initial" animate="animate" exit="exit">
              <motion.p className="imm-count" variants={piece}>
                Vaš plan podrške
              </motion.p>
              <motion.h1 className="imm-title" variants={piece}>
                {said || `Evo plana za ${plan.firstName}`}
              </motion.h1>

              {srFrailty && (
                <motion.div className="imm-cfs" variants={list}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                    <motion.span
                      key={l}
                      variants={piece}
                      className={`imm-cfs-step${l === srFrailty.level ? ' is-current' : ''}${
                        l < srFrailty.level ? ' is-passed' : ''
                      }`}
                    >
                      {l}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {plan.narrative.map((p, i) => (
                <motion.p className="imm-plan-summary" variants={piece} key={i}>
                  {p}
                </motion.p>
              ))}

              <motion.p className="imm-plan-note" variants={piece}>
                {caregivers.length} negovateljica odgovara ovoj slici.
              </motion.p>

              <motion.div className="imm-actions" variants={piece}>
                <Button variant="primary" size="lg" onClick={onFinish}>
                  Pogledaj ceo plan <ArrowUpRight size={14} strokeWidth={2} />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
