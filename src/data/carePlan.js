import { optionTitles } from './flow';

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

const listOr = (items, fallback) => (items.length ? items.join(', ').toLowerCase() : fallback);

// Builds the care plan intro from what the user actually answered, so the
// artifact visibly reflects the questionnaire.
export function buildPlan(answers) {
  const name = answers['basic-info']?.values?.name?.trim() || 'your loved one';
  const firstName = name.split(' ')[0];
  const schedule = optionTitles('care-schedule', answers['care-schedule']);
  const days = optionTitles('care-days', answers['care-days']);
  const times = optionTitles('care-time', answers['care-time']);
  const tasks = optionTitles('tasks', answers['tasks']);
  const mobility = optionTitles('mobility', answers['mobility']);
  const conditions = optionTitles('conditions', answers['conditions']);

  const summary =
    `Based on everything you shared, ${firstName} needs ${listOr(schedule, 'regular support')} ` +
    `on ${days.length ? `${days.length} days a week` : 'a schedule you set'}, mainly with ` +
    `${listOr(tasks, 'day-to-day support')}. We matched ${caregivers.length} caregivers in your area ` +
    `who have worked with exactly this combination before.`;

  const facts = [
    { label: 'Care for', value: name },
    { label: 'Schedule', value: schedule[0] || '—' },
    { label: 'Days', value: days.length ? `${days.length} per week` : '—' },
    { label: 'Time of day', value: times.join(', ') || '—' },
    { label: 'Mobility', value: mobility[0] || '—' },
    {
      label: 'Conditions',
      value: conditions.filter((c) => c !== 'None of these').join(', ') || 'None reported',
    },
  ];

  return { name, firstName, summary, facts };
}
