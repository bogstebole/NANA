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
    name: 'record_note',
    description:
      'Zapamti nešto važno što je korisnik rekao a ne pripada nijednom pitanju iz liste — okolnost, strah, ograničenje, detalj o porodici. Bez ovoga bi to nestalo. Ulazi u plan podrške.',
    input_schema: {
      type: 'object',
      properties: { tekst: { type: 'string', description: 'Jedna rečenica, njegovim rečima gde možeš.' } },
      required: ['tekst'],
    },
  },
  {
    name: 'ask',
    description:
      'Postavi pitanje iz liste. Tekst pitanja pišeš sam, u svojoj poruci — ovaj alat samo određuje koje kartice se prikazuju ispod. Pozovi ga jednom na kraju poteza.',
    input_schema: {
      type: 'object',
      properties: { questionId: { type: 'string', description: 'id pitanja iz liste preostalih' } },
      required: ['questionId'],
    },
  },
  {
    name: 'follow_up',
    description:
      'Postavi svoje potpitanje, koje ne postoji u listi — kada ti nešto nije jasno, kada je korisnik rekao nešto što traži pojašnjenje, ili kada bi defaultno sledeće pitanje zvučalo kao da ga nisi čula. Nema kartica; korisnik piše. Koristi umereno i nikad dvaput zaredom.',
    input_schema: {
      type: 'object',
      properties: {
        predlozi: {
          type: 'array',
          items: { type: 'string' },
          description: 'Do četiri kratka predloga odgovora, kao meki nagoveštaj. Opciono.',
        },
      },
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

# Kako počinje
Prvi ekran nije pitanje nego prazan papir — čovek svojim rečima opiše šta se dešava. Iz tog jednog pasusa izvuci sve što možeš odjednom preko \`record_answers\`, pa nastavi od onoga što fali. Ne vraćaj se na ono što je već rekao, ni u drugoj formulaciji.
Ako je napisao malo ili ništa, samo kreni od prvog pitanja.

# Kako radiš
Postavljaš jedno pitanje odjednom, pozivom alata \`ask\`.
Tekst pitanja uvek pišeš sama, u svojoj poruci. \`ask\` samo bira koje kartice se prikazuju ispod. Nikad ne recituj formulaciju iz liste — ona ti je samo podatak o tome šta treba da saznaš.
Nadovezuj se. Ako je čovek upravo rekao da živi u drugom gradu, sledeće pitanje to uvažava umesto da nastavi kao da nije rekao ništa.
Kada nešto nije jasno ili kada bi sledeće pitanje zvučalo gluvo, postavi svoje potpitanje preko \`follow_up\` umesto da guraš dalje.
Kada čovek kaže nešto važno što ne pripada nijednom pitanju, zabeleži to preko \`record_note\`.
Pitanja tipa \`inputs\` nemaju kartice — čovek odgovara jednom rečenicom, a ti iz nje izvučeš polja. „Bogdan, sin, 063 555 210" je ime, srodstvo i telefon. Ako nešto od obaveznih polja fali, pitaj samo za to što fali, ne za sve ponovo.
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
export function stateMessage(answers, notes = []) {
  const remaining = remainingQuestions(answers);
  const frailty = frailtyOf(answers);

  if (!remaining.length) {
    return 'Sva pitanja su odgovorena. Zahvali se u jednoj rečenici i reci da sada praviš plan podrške. Ne pozivaj `ask` ni `follow_up`.';
  }

  return [
    frailty
      ? `Trenutna procena krhkosti: nivo ${frailty.level}. Ne pominji je korisniku — biće mu prikazana zasebno.`
      : 'Još nema dovoljno odgovora za procenu krhkosti.',
    notes.length
      ? `Već zabeleženo van pitanja (ne pitaj ponovo):\n${notes.map((n) => `- ${n}`).join('\n')}`
      : null,
    `Preostala pitanja (${remaining.length}), redom:`,
    JSON.stringify(remaining, null, 1),
  ]
    .filter(Boolean)
    .join('\n');
}
