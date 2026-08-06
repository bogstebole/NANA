# NANA Prime — Onboarding prototype

Interactive prototype of the client onboarding flow (register → branching frailty assessment → care plan), built 1:1 against the Figma design ("Nana Prime" file) with design tokens mirrored from the "NANA Prime - Tailwind config" file.

## Run

```bash
npm install
npm run dev
```

Opens on http://localhost:5180.

## Shell

After registering, the user is inside their own account: a left nav with **Chat**,
**Dashboard**, **Care plans**, **Profile** and **Settings**. The chat stays mounted
behind the other views so switching away never loses its progress, and `answers`
lives in `App` so the profile reads the same data the assistant collected — no
second source of truth.

- **Chat** — the row carries its own **+** so a new chat is one click away without opening the list; selecting Chat unfolds the thread list underneath. Starting a new chat files the current one away first, but only if it produced a plan, so untouched threads don't clutter the history. A past thread replays read only: the same messages and question cards, with the answers as chips, editing removed and an archived footer in place of the composer. Threads store their `answers`, so the replay is rendered by the same components as the live chat.
- **Dashboard** — every caregiver request and where it stands: accepted, waiting, or declined. A decline always carries the reason, so the user is never left guessing. Empty until they've actually contacted someone.
- **Care plans** — the live plan plus archived ones, newest first.
- **Profile** — account details and everything the questionnaire collected, editable back in the chat.
- **Settings** — notification toggles, subscription state, account actions.

The nav, statuses and screens are placeholder structure for the concept — mock data
lives in `src/data/bookings.js`, and status colours come from the Tailwind config
scales, so replacing them with the real design is a styling job, not a rewrite.

## Question content

The questions come from the client's "Conversation Flow AI" document. It is not a flat
form — it is an assessment that branches:

1. **Getting to know you** — who the care is for, who is calling, household, home condition.
2. **Daily life** — eight questions that establish how they move, manage and have changed.
3. **Frailty assessment** — the flow's pivot. `src/data/frailty.js` estimates a level on
   the Clinical Frailty Scale (1–9) from those answers, and the assistant states it before
   asking anything else. Shown as a card in the chat and a full screen in the immersive
   variant. It is labelled an estimate, not a diagnosis.
4. **Support** — *branches on the level*. 1–3 asks about lifestyle and prevention, 4–5 about
   the housework, 6 about hands-on personal care, 7–8 about bed mobility, eating, pressure
   sores and breathing support, 9 about palliative needs. `when({ band, level })` on a
   question makes it conditional; `applicableQuestions()` resolves the list.
5. **Reason for contact** — what brought them, how it started, hospital stay, and what a
   good outcome looks like for the family.

The recommendation follows the document's formula — frailty 50%, reason for contact 35%,
context 15% (`WEIGHTS` in `frailty.js`) — and the first moves per reason come straight from
its scenarios.

Copy is in English to match the rest of the prototype and the Figma design; the source
document is Serbian. Every string lives in `src/data/flow.js`, so switching is a data edit.

## Questionnaire variants

The nav carries a **Classic / Immersive** switch. Both ask the same questions and
write into the same `answers` in `App`, so you can switch mid-flow: answers given in
one show up in the other, and the immersive variant resumes at the first unanswered
question rather than restarting.

**Immersive** is a fullscreen take: one question at a time, glass cards over drifting
clouds, with generative ambient audio.

- Transitions are **staggered in both directions**: the outgoing screen unwinds from
  the bottom up (`staggerDirection: -1`), the incoming one builds from the top down,
  option lists staggering their own rows inside that. About 1.1s end to end.
- The counter tracks **position in the flow**, not committed answers — a four-field
  question commits once, so counting answers left the number frozen for four screens
  and then jumping by four.

- Multi-field questions are split into **one field per screen**, each with its own
  conversational prompt and hint (`src/data/prompts.js`) — the copy lives with the
  immersive variant, the classic form keeps its shorter labels. The answer is only
  committed once the last field is filled, so a half-finished question never counts
  as answered in either variant. Selects stay as they are.
- It does **not** close to reveal the result: the finished care plan is shown inside
  the experience, and only then does **See the full plan** exit and land on that
  plan's page — the dashboard stays empty until a caregiver is actually requested,
  so it would be an anticlimax to land there.

- **Clouds** — `src/components/immersive/CloudBackground.jsx`. A raw WebGL fragment
  shader, no libraries: domain-warped fbm noise over a pale golden-hour sky, drifting
  at 0.015× time. Rendered at 0.75× resolution and capped at 1.25 DPR — the clouds are
  soft, so the upscale costs nothing visually. Falls back to a CSS sky gradient if
  WebGL or shader compilation is unavailable.
- **Audio** — `src/lib/zenAudio.js`. Web Audio only, no files and nothing to license:
  a detuned sine drone, band-passed noise for air, and pentatonic tones blooming on a
  loose random timer, so it never loops audibly. Starts from a click, so autoplay
  policies are satisfied. Mute is in the top-right.
- Honours `prefers-reduced-motion`: the clouds render one frame and hold.

## Flow

The questionnaire itself is framed as an AI chat. There is no wizard footer — the
assistant posts one section at a time, the answered cards stay in the thread as
artifacts, and the composer at the bottom is the only persistent control.

1. **Register** — name + email (both required, email validated)
2. **Chat** — the assistant greets the user, then works through the sections one at a
   time (see Question content above)
   - Each section is introduced by a plain assistant message, not a title — finishing one makes the assistant "think", then post the next
   - Exactly one question is active across the whole thread; answered ones collapse into an overview row with answer chips and a pencil edit button; the rest stay listed as pending, so how much is left in the section is always visible
   - Clicking a collapsed row re-opens it for editing at any point, in any section, and unfolds that section so the active card is never hidden
   - Question types: multi-input (Next button), single select (auto-advance), multi select (Next button)
   - No Continue button and no step titles — the composer is the only persistent control
   - The composer is disabled until the questions are done, then accepts free-text messages

A finished section folds down to a single summary row — the answer count and the
question titles — from `FOLDABLE_FROM` rows up. It started as a peek at the list
under a gradient, but that cost more height than the answers it revealed: a folded
section measured 172px against 68px for the summary row.
3. **Care plan** — once everything is answered the assistant posts the plan as a chat
   artifact: a grey container holding a white document, with a summary and fact grid
   generated from the actual answers, plus the top matches.

## Paywall

The only thing sold is caregiver contact. Everything else in the plan — the summary,
the full caregiver list, the doctor and equipment recommendations — is readable for free.

- The chat card is a **preview**: summary, facts and the top 2 matches. The open
  affordance is deliberate — an "Open ↗" pill in the header, a primary-coloured hover
  state on the whole card, and an explicit CTA.
- Opening it reveals the **sidebar** with all caregivers in full detail plus both
  recommendation sections, unmasked.
- **Tapping a caregiver opens the paywall**, which asks for the user's own phone number
  (the introduction is made by SMS, so it doubles as lead capture) and then payment.
- **Phone numbers are never sent to a locked client.** `caregiversFor(unlocked)` in
  `src/data/carePlan.js` strips `phone` from the objects entirely, and the row renders
  a `+381 •• ••• ••••` placeholder that is not derived from the real number. Nothing is
  hidden with CSS, so there is no real digit in the DOM to recover — the projection is
  what the API should do server-side.
- Paying flips a single `unlocked` flag that the sidebar, the in-chat card and the
  assistant's replies all react to. The payment step itself is simulated.

## Structure

- `src/styles/tokens.css` — Figma variables (primitives + semantic aliases)
- `src/data/flow.js` — all step/question content; edit this to change copy or add questions
- `src/data/carePlan.js` — caregivers, recommendations, and the summary built from the answers
- `src/components/` — Button, Chip, NumberIndicator, SelectCard, SelectInput, TextField, QuestionItem, ChatInput, CarePlanCard, CaregiverRow, CaregiverSidebar, PhotoCarousel, Logo
- `src/screens/` — Register, Chat

Icons are [lucide-react](https://lucide.dev) at `size={14} strokeWidth={1.75}`, which renders a ~1px stroke at 14px to match the design's icon tokens.

## Animation notes

- The question card resizes with FLIP (`layout` on the wrapper). Because FLIP animates size via `scale`, the content inside carries `layout="position"` so Framer counter-scales it — without that, all the text stretches during collapse/expand. `borderRadius` is set in `style` (not a class) so scale correction can reach it.
- `AnimatePresence mode="popLayout"` takes the outgoing content out of flow so it is never squashed on its way out.
- No `layoutId` is used anywhere — the morph is a single element resizing, not a shared-element transition.
- `PhotoCarousel` is a Material 3 multi-browse carousel that auto-advances every 2.8s: an item enters small on the right, grows into the hero slot, then shrinks away to the left. Slot widths come from the Figma layout; images are fixed-width and center-cropped by their slot, so narrowing crops rather than squashes. Honors `prefers-reduced-motion`.

Note: `?forceRaf` URL param is a test hook that keeps animations running in headless/background tabs — irrelevant for normal use.
