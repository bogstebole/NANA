import { optionTitles } from './flow';
import { frailtyOf } from './frailty';

// Matched caregivers. `match` is the fake relevance score the assistant "computed"
// from the questionnaire — it exists to sell the AI framing in the prototype.
export const caregivers = [
  {
    id: 'vesna',
    name: 'Vesna Mitrović',
    initials: 'VM',
    match: 97,
    years: 12,
    rating: 4.9,
    reviews: 64,
    rate: '850 RSD/h',
    area: 'Vračar',
    distance: '1.8 km away',
    bio: 'Certified geriatric nurse. Twelve years with families caring for a parent at home, most of them with early-stage dementia.',
    tags: ['Dementia care', 'Medication', 'Personal care'],
    phone: '+381 63 210 4471',
  },
  {
    id: 'snezana',
    name: 'Snežana Popović',
    initials: 'SP',
    match: 94,
    years: 15,
    rating: 5.0,
    reviews: 88,
    rate: '950 RSD/h',
    area: 'Vračar',
    distance: '2.4 km away',
    bio: 'Fifteen years in home care, including post-stroke recovery. Cooks, keeps a written daily log and reports back to the family every evening.',
    tags: ['Meals', 'Mobility support', 'Daily reports'],
    phone: '+381 64 118 9032',
  },
  {
    id: 'dragana',
    name: 'Dragana Ilić',
    initials: 'DI',
    match: 91,
    years: 8,
    rating: 4.8,
    reviews: 41,
    rate: '780 RSD/h',
    area: 'Zvezdara',
    distance: '3.1 km away',
    bio: 'Warm and patient, known for getting reluctant clients out for a daily walk. Available for weekend shifts.',
    tags: ['Companionship', 'Household', 'Weekends'],
    phone: '+381 62 447 1120',
  },
  {
    id: 'gordana',
    name: 'Gordana Nikolić',
    initials: 'GN',
    match: 88,
    years: 20,
    rating: 4.9,
    reviews: 130,
    rate: '1000 RSD/h',
    area: 'Savski venac',
    distance: '4.0 km away',
    bio: 'The most experienced caregiver in our network. Trained in transfers and fall prevention, works with clients who need full assistance.',
    tags: ['Transfers', 'Fall prevention', 'Personal care'],
    phone: '+381 60 993 2218',
  },
  {
    id: 'ljiljana',
    name: 'Ljiljana Marković',
    initials: 'LM',
    match: 84,
    years: 6,
    rating: 4.7,
    reviews: 29,
    rate: '720 RSD/h',
    area: 'Voždovac',
    distance: '5.2 km away',
    bio: 'Former hospital assistant. Calm in emergencies and comfortable coordinating with doctors and pharmacies.',
    tags: ['Medication', 'Doctor visits', 'Meals'],
    phone: '+381 65 302 7754',
  },
  {
    id: 'mirjana',
    name: 'Mirjana Jovanović',
    initials: 'MJ',
    match: 81,
    years: 9,
    rating: 4.8,
    reviews: 52,
    rate: '800 RSD/h',
    area: 'Novi Beograd',
    distance: '6.7 km away',
    bio: 'Nine years of overnight shifts. A good fit if the schedule shifts towards nights later on.',
    tags: ['Overnight', 'Companionship', 'Household'],
    phone: '+381 63 771 5580',
  },
];

// What a locked phone number looks like. Deliberately not derived from the real
// number — no real digit reaches the client until the plan is paid for.
export const MASKED_PHONE = '+381 ** *** ****';

// Mirrors what the API should do: `phone` is simply absent from the payload until
// the plan is unlocked, so it never sits in the DOM waiting to be read out.
export function caregiversFor(unlocked) {
  return caregivers.map(({ phone, ...rest }) => (unlocked ? { ...rest, phone } : rest));
}

export const medicalTips = [
  {
    title: 'Book a geriatric assessment',
    body: 'A one-off consult that maps out cognition, mobility and medication in a single visit. Most Belgrade health centers schedule it within three weeks.',
  },
  {
    title: 'Ask for a medication review',
    body: 'Bring every box, including supplements. Interactions between blood pressure and sleep medication are the single most common cause of falls at home.',
  },
  {
    title: 'Set a blood pressure routine',
    body: 'Twice daily, same times, written down. Your caregiver can log this and flag anything outside the range your doctor sets.',
  },
];

export const equipment = [
  {
    title: 'Rollator walker with seat',
    body: 'Steadier than a cane and gives a place to rest mid-walk. Roughly 12.000 RSD.',
  },
  {
    title: 'Grab bars and a non-slip mat',
    body: 'The bathroom is where most falls happen. Two bars and a mat cost under 6.000 RSD fitted.',
  },
  {
    title: 'Weekly pill organiser',
    body: 'Removes the daily "did she take it?" question and makes the caregiver handover unambiguous.',
  },
  {
    title: 'Upper-arm blood pressure monitor',
    body: 'Upper-arm cuffs are meaningfully more accurate than wrist models for this age group.',
  },
];


// The document's scenarios: what gets arranged depends far more on why the family
// called than on the frailty level alone. Each entry is a coordinator's first move.
const REASON_ACTIONS = {
  fall: [
    'A nurse visit to assess the fall and check for injury',
    'A home fall-risk assessment',
    'A physiotherapist, then a caregiver once she is steadier',
  ],
  memory: [
    'A cognitive screening with a neuropsychiatrist',
    'A caregiver experienced with dementia',
    'A safety check of the flat — hob, locks, keys',
  ],
  discharge: [
    'A nurse for the first week after discharge',
    'Medication reconciliation against the discharge letter',
    'Daily caregiver visits while she regains strength',
  ],
  loneliness: [
    'A companion caregiver on a regular rhythm',
    'Getting her out to a local social group',
    'Transport so visits stop depending on the family',
  ],
  medication: [
    'A medication review with the GP',
    'A weekly organiser prepared by the caregiver',
    'Reminder visits at the times that matter',
  ],
  diagnosis: [
    'A caregiver with experience of this condition',
    'Coordination with the treating specialist',
    'Equipment suited to how the condition progresses',
  ],
  'home-help': [
    'A caregiver for cooking, laundry and shopping',
    'A deeper clean to reset the flat',
    'A regular weekly rhythm so it does not slip again',
  ],
  respite: [
    'A caregiver covering the hours you need back',
    'Cover arranged for a longer break',
    'A single coordinator so you stop managing it',
  ],
  'daily-living': [
    'A caregiver for the parts of the day that are hardest',
    'Help with meals and medication',
    'A weekly check-in call with you',
  ],
};

// What the frailty level itself calls for, before the reason is layered on.
const BAND_ACTIONS = {
  light: 'Light-touch support — company, transport and keeping her active.',
  moderate: 'Regular caregiver visits for the house, meals and errands.',
  high: 'Hands-on personal care, with fall prevention as the priority.',
  severe: 'Nursing-level care. A caregiver alone would not be enough here.',
  palliative: 'Palliative coordination — nursing, medication delivery and family support.',
};

// Option titles read fine on a card but not mid-sentence: "it came on it's been
// this way a long time". These are the same answers, phrased to be quoted.
const ONSET_PHRASE = {
  sudden: 'and it came on suddenly',
  gradual: 'and it has come on gradually',
  'long-standing': 'and it has been this way a long time',
};

const CAREGIVER_ROLE = {
  light: 'companion',
  moderate: 'caregiver',
  high: 'experienced caregiver',
  severe: 'nurse alongside a caregiver',
  palliative: 'palliative team',
};

// Builds the care plan from what the user actually answered, so the artifact
// visibly reflects the questionnaire — and follows the client's formula:
// decision = frailty (50%) + reason for contact (35%) + context (15%).
export function buildPlan(answers) {
  const name = answers['about-person']?.values?.name?.trim() || 'your loved one';
  const firstName = name.split(' ')[0];
  const frailty = frailtyOf(answers);
  const band = frailty?.band ?? 'moderate';

  const reasonId = answers['reason-for-contact']?.optionId;
  const reason = optionTitles('reason-for-contact', answers['reason-for-contact'])[0];
  const onsetId = answers['onset']?.optionId;
  const onset = optionTitles('onset', answers['onset'])[0];
  const hospital = optionTitles('hospitalisation', answers['hospitalisation'])[0];
  const mobility = optionTitles('mobility', answers['mobility'])[0];
  const dailyHelp = optionTitles('daily-help', answers['daily-help'])[0];
  const goal = answers['family-goal']?.values?.goal?.trim();

  const actions = REASON_ACTIONS[reasonId] || REASON_ACTIONS['daily-living'];

  const summary =
    `${firstName} looks like level ${frailty?.level ?? '—'} on the frailty scale — ` +
    `${(frailty?.label ?? 'assessed').toLowerCase()}. ${BAND_ACTIONS[band]} ` +
    (reason ? `You came to us because ${reason.toLowerCase()}` : '') +
    (reason && ONSET_PHRASE[onsetId] ? `, ${ONSET_PHRASE[onsetId]}. ` : reason ? '. ' : '') +
    `We matched ${caregivers.length} people who fit that picture.`;

  const facts = [
    { label: 'Care for', value: name },
    { label: 'Frailty level', value: frailty ? `${frailty.level} · ${frailty.label}` : '—' },
    { label: 'Getting around', value: mobility || '—' },
    { label: 'Help needed', value: dailyHelp || '—' },
    { label: 'Reason for contact', value: reason || '—' },
    { label: 'How it started', value: onset || '—' },
    { label: 'Hospital stay', value: hospital || '—' },
  ];

  return {
    name,
    firstName,
    summary,
    facts,
    frailty,
    band,
    reason,
    goal,
    actions,
    role: CAREGIVER_ROLE[band],
  };
}
