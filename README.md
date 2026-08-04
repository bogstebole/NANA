# NANA Prime — Onboarding prototype

Interactive prototype of the client onboarding flow (register → 4-step questionnaire → completion), built 1:1 against the Figma design ("Nana Prime" file) with design tokens mirrored from the "NANA Prime - Tailwind config" file.

## Run

```bash
npm install
npm run dev
```

Opens on http://localhost:5180.

## Flow

The whole thing is framed as an AI chat. There is no wizard footer — the assistant
posts one step at a time, the answered cards stay in the thread as artifacts, and
the composer at the bottom is the only persistent control.

1. **Register** — name + email (both required, email validated)
2. **Chat** — the assistant greets the user, then works through four sections one at
   a time: Elderly profile, Emergency contacts, Caregiver tasks, Health condition
   - Each section is introduced by a plain assistant message, not a title — finishing one makes the assistant "think", then post the next
   - Exactly one question is active across the whole thread; answered ones collapse into an overview row with answer chips and a pencil edit button; the rest stay listed as pending, so how much is left in the section is always visible
   - Clicking a collapsed row re-opens it for editing at any point, in any section, and unfolds that section so the active card is never hidden
   - Question types: multi-input (Next button), single select (auto-advance), multi select (Next button)
   - No Continue button and no step titles — the composer is the only persistent control
   - The composer is disabled until the questions are done, then accepts free-text messages

A finished section folds down to ~two rows under a gradient with a **See all answers**
toggle — but only from `FOLDABLE_FROM` rows up. The toggle costs about as much height
as a collapsed row, so folding a three-row section measured 232px → 216px while hiding
content; below the threshold the section simply stays open.
3. **Care plan** — once everything is answered the assistant posts the plan as a chat
   artifact: a grey container holding a white document, with a summary and fact grid
   generated from the actual answers, plus the top matches.

`src/data/flow.js` still groups questions into `steps` for readability while editing
copy; the chat renders the flattened `questions` export.

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
