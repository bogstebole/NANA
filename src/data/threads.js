import { buildPlan } from './carePlan';

// Past conversations. A thread keeps the answers it collected, so opening it
// replays the same question cards the live chat renders — just read only.
export const seedThreads = [
  {
    id: 'may',
    title: 'After the fall in May',
    date: '12 May 2026',
    summary:
      'Milica had fallen twice and was struggling with the stairs. We arranged a nurse assessment first, then a caregiver four mornings a week.',
    caregivers: 4,
    answers: {
      'about-person': {
        values: { name: 'Milica Stevanović', age: '84', city: 'Vračar, Beograd' },
      },
      'about-you': {
        values: {
          'your-name': 'Bogdan Stevanović',
          relation: 'Son',
          'your-phone': '+381 63 555 210',
        },
      },
      household: { optionId: 'alone' },
      'home-condition': { optionId: 'mostly-fine' },
      mobility: { optionId: 'stick' },
      'going-out': { optionId: 'little-help' },
      'daily-help': { optionId: 'occasional' },
      'self-care': { optionIds: ['dressing', 'toilet', 'medication'] },
      falls: { optionId: 'more-than-once' },
      outdoors: { optionId: 'weekly' },
      slowing: { optionId: 'little' },
      overall: { optionId: 'house-help' },
      'household-tasks': { optionIds: ['cooking', 'shopping', 'cleaning'] },
      'who-helps-now': { optionId: 'family' },
      'reason-for-contact': { optionId: 'fall' },
      onset: { optionId: 'sudden' },
      hospitalisation: { optionId: 'none' },
      'family-goal': {
        values: { goal: 'That she can stay in her own flat', worry: 'Another fall while I’m at work' },
      },
    },
    messages: [
      { role: 'user', text: 'Can we move the visits to the afternoon instead?' },
      {
        role: 'assistant',
        text: 'Done — the plan now assumes afternoon visits. Ljiljana and Mirjana both still fit that schedule, the other two only work mornings.',
      },
    ],
  },
  {
    id: 'february',
    title: 'After the hospital discharge',
    date: '3 February 2026',
    summary:
      'First plan after Milica came home from hospital. A nurse for the first week, then daily caregiver visits while she regained her strength.',
    caregivers: 3,
    answers: {
      'about-person': {
        values: { name: 'Milica Stevanović', age: '83', city: 'Vračar, Beograd' },
      },
      'about-you': {
        values: {
          'your-name': 'Bogdan Stevanović',
          relation: 'Son',
          'your-phone': '+381 63 555 210',
        },
      },
      household: { optionId: 'alone' },
      'home-condition': { optionId: 'needs-help' },
      mobility: { optionId: 'walker' },
      'going-out': { optionId: 'never-out' },
      'daily-help': { optionId: 'several-times' },
      'self-care': { optionIds: ['toilet'] },
      falls: { optionId: 'once' },
      outdoors: { optionId: 'never' },
      slowing: { optionId: 'lot' },
      overall: { optionId: 'most-help' },
      'personal-care': { optionIds: ['bathing', 'dressing', 'transfer'] },
      'fall-risk': { optionId: 'high' },
      'reason-for-contact': { optionId: 'discharge' },
      onset: { optionId: 'sudden' },
      hospitalisation: { optionId: 'recent' },
      'family-goal': {
        values: { goal: 'That she gets back on her feet at home', worry: 'That she gives up trying' },
      },
    },
    messages: [
      { role: 'user', text: 'How soon can someone start?' },
      {
        role: 'assistant',
        text: 'Two of the three can start within 48 hours. I’ve flagged your request as urgent so they see it first.',
      },
    ],
  },
];

// One list for every care plan the user has: the live one plus each past thread.
// The Care plans page, its detail page and the nav all read from this, so they
// can never disagree about what exists.
export function planEntries({ plan, threads, caregiverCount, today }) {
  const live = plan
    ? {
        id: 'live',
        plan,
        title: `Care plan for ${plan.name}`,
        date: today,
        status: 'Active',
        summary: plan.summary,
        caregiverCount,
        archived: false,
      }
    : null;

  const past = threads.map((t) => ({
    id: t.id,
    plan: buildPlan(t.answers),
    title: `Care plan for ${t.answers['about-person']?.values?.name ?? 'your loved one'}`,
    date: t.date,
    status: 'Archived',
    summary: t.summary,
    caregiverCount: t.caregivers,
    archived: true,
  }));

  return [live, ...past].filter(Boolean);
}
