import { applicableQuestions, flowContext, questionById, steps } from './flow';
import { frailtyOf } from './frailty';
import { Q, STEP_INTRO } from './flow.sr';

// The AI variant's contract with the model.
//
// The division of labour is the whole design: **Claude owns the words, flow.js
// owns the data.** Claude decides what to ask next and how to phrase it; the
// question ids, the option ids and the answer shapes stay exactly as the other
// two variants write them, because the frailty scoring, the branching and the
// care plan all read those ids. A model free to invent options would produce
// answers that score nothing and a plan built on nothing.

export const MODEL = 'claude-opus-5';

// What is still to be asked, given everything answered so far. Recomputed every
// turn because the frailty band decides which questions exist at all.
//
// The support section is withheld until daily life is fully answered. The
// estimate exists from the first answer onward, but a band derived from two
// answers is not one to branch on: the model would ask a branch question, the
// band would move as the rest of daily life landed, and `reconcile` would drop
// the answer it had just collected. The other two variants get this for free
// from walking the steps in order; here the model chooses, so it has to be said.
export function remainingQuestions(answers) {
  const level = frailtyOf(answers)?.level;
  const ctx = flowContext(answers, level);
  const dailyLife = steps.find((s) => s.id === 'daily-life');
  const bandIsSettled = dailyLife.questions.every((q) => answers[q.id]);

  return steps.flatMap((step) => {
    if (step.id === 'support' && !bandIsSettled) return [];
    return applicableQuestions(step, ctx)
      .filter((q) => !answers[q.id])
      .map((q) => serialize(q, step.id));
  });
}

function serialize(q, stepId) {
  const sr = Q[q.id] || {};
  const out = { id: q.id, sekcija: stepId, pitanje: sr.title || q.title, tip: q.type };

  if (q.type === 'inputs') {
    out.polja = q.fields.map((f) => ({
      id: f.id,
      naziv: sr.fields?.[f.id] || f.label,
      obavezno: !f.optional,
    }));
  } else {
    out.opcije = q.options.map((o) => ({ id: o.id, tekst: sr.options?.[o.id] || o.title }));
    if (q.allowEmpty) out.moze_prazno = true;
    if (q.allowOther) out.moze_slobodan_unos = true;
  }
  return out;
}

// The answer the model reports, in the shape the rest of the app already stores.
export function toAnswer(entry) {
  const q = questionById[entry.questionId];
  if (!q) return null;
  if (q.type === 'inputs') {
    return entry.values ? { values: entry.values } : null;
  }
  if (q.type === 'single') {
    return entry.optionId ? { optionId: entry.optionId } : null;
  }
  const ids = (entry.optionIds || []).filter((id) => q.options.some((o) => o.id === id));
  const other = entry.other?.trim();
  if (!ids.length && !other && !q.allowEmpty) return null;
  return { optionIds: ids, ...(other ? { other } : {}) };
}

export const TOOLS = [
  {
    name: 'record_answers',
    description:
      'Zabeleži jedan ili više odgovora. Pozovi ovo čim iz onoga što je korisnik napisao možeš da popuniš neko pitanje — i kada jednom rečenicom odgovori na više njih odjednom. Koristi isključivo id-jeve iz liste preostalih pitanja.',
    input_schema: {
      type: 'object',
      properties: {
        odgovori: {
          type: 'array',
          description: 'Odgovori koje beležiš u ovom potezu.',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string', description: 'id pitanja' },
              optionId: { type: 'string', description: 'Za tip "single": id izabrane opcije.' },
              optionIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Za tip "multi": id-jevi svih izabranih opcija.',
              },
              other: {
                type: 'string',
                description:
                  'Za tip "multi" sa moze_slobodan_unos: ono što je korisnik rekao a ne postoji među opcijama, njegovim rečima.',
              },
              values: {
                type: 'object',
                additionalProperties: { type: 'string' },
                description: 'Za tip "inputs": vrednosti po id-ju polja.',
              },
            },
            required: ['questionId'],
          },
        },
      },
      required: ['odgovori'],
    },
  },
  {
    name: 'ask',
    description:
      'Prikaži korisniku kartice za odgovor na ovo pitanje. Pozovi ovo tačno jednom na kraju svakog svog poteza, osim kada su sva pitanja gotova.',
    input_schema: {
      type: 'object',
      properties: { questionId: { type: 'string', description: 'id pitanja koje sada postavljaš' } },
      required: ['questionId'],
    },
  },
];

export function systemPrompt(user) {
  const ime = user.name?.split(' ')[0] || '';

  return `Ti si Jovana Đorđević, koordinator nege u NANA Prime — srpskoj firmi koja porodicama nalazi gerontodomaćice za brigu o starijim roditeljima.

Razgovaraš sa osobom koja se javila${ime ? ` (${ime})` : ''}. Ona brine o nekom starijem i ne zna odakle da počne. Tvoj posao nije da popuniš formular nego da razumeš situaciju — a usput ti trebaju konkretni podaci da bismo mogli da preporučimo pravu podršku.

# Kako pričaš
Kratko. Jedna do dve rečenice pre pitanja, nikad više. Toplo, ali bez patetike i bez fraza tipa „razumem koliko vam je teško".
Obraćaš se sa „vi". Pišeš latinicom, na srpskom.
Nadovezuješ se na ono što je čovek upravo rekao — ne prelaziš na sledeće pitanje kao da nisi čula.
Nikad ne nabrajaš ponuđene opcije u tekstu. Korisnik ih vidi kao kartice ispod tvoje poruke.

# Kako radiš
Postavljaš jedno pitanje odjednom, pozivom alata \`ask\`.
Kada iz onoga što je čovek napisao možeš da popuniš neko pitanje, odmah to zabeležiš preko \`record_answers\` — i kada jednom rečenicom odgovori na više njih. „Pala je dvaput prošle godine i više ne može da kuva" su dva odgovora, ne jedan.
Nikad ne pitaš ono što već znaš.
Ako je odgovor nejasan, pitaj da razjasniš umesto da nagađaš. Ako je jasan, ne traži potvrdu.
Redosled je tvoj, ali drži se sekcija: prvo upoznavanje, pa svakodnevni život, pa podrška, pa razlog poziva.

# Šta ne radiš
Ne izmišljaš pitanja ni opcije van liste. Ne postavljaš medicinske dijagnoze. Ne obećavaš cene, rokove ni konkretne osobe.
Ne komentarišeš sopstveni proces („sada ću da zabeležim…", „idemo dalje na sledeću sekciju").

# Uvodne rečenice za sekcije, kao orijentir — parafraziraj ih, ne recituj
${Object.entries(STEP_INTRO)
  .map(([id, text]) => `- ${id}: ${text}`)
  .join('\n')}`;
}

// Sent as a system-role message each turn: the remaining questions change as the
// frailty band moves, and this keeps that list beside the conversation without
// rewriting the cached system prompt above it.
export function stateMessage(answers) {
  const remaining = remainingQuestions(answers);
  const frailty = frailtyOf(answers);

  if (!remaining.length) {
    return 'Sva pitanja su odgovorena. Zahvali se u jednoj rečenici i reci da sada praviš plan podrške. Ne pozivaj `ask`.';
  }

  return [
    frailty
      ? `Trenutna procena krhkosti: nivo ${frailty.level}. Ne pominji je korisniku — biće mu prikazana zasebno.`
      : 'Još nema dovoljno odgovora za procenu krhkosti.',
    `Preostala pitanja (${remaining.length}), redom:`,
    JSON.stringify(remaining, null, 1),
  ].join('\n');
}
