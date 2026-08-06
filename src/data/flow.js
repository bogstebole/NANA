import { bandOf } from './frailty';

// Question content follows the client's "Conversation Flow AI" document. It is not a
// flat questionnaire: three fixed sections estimate a Clinical Frailty Scale level,
// the fourth branches on that level, and the last asks what prompted the call.
//
// Question types:
//  - inputs: several free-text fields inside one card (Next button)
//  - single: pick one option, auto-advances
//  - multi:  pick several options, confirm with Next
//
// `when({ band, level })` makes a question conditional. Questions without it always ask.
export const steps = [
  {
    id: 'getting-to-know',
    intro:
      'Welcome to NANA Prime. I’m Jovana, your care coordinator. Before I recommend any support, I’d like to get to know you and the person you’re caring for.',
    questions: [
      {
        id: 'about-person',
        type: 'inputs',
        title: 'Who are we caring for?',
        subtitle: 'Just the basics for now — we’ll go into detail together',
        shortTitle: 'About them',
        fields: [
          { id: 'name', label: 'Their name', placeholder: 'Milica Stevanović' },
          { id: 'age', label: 'Age', placeholder: '84' },
          { id: 'city', label: 'Where they live', placeholder: 'Vračar, Beograd' },
        ],
      },
      {
        id: 'about-you',
        type: 'inputs',
        title: 'And who am I speaking with?',
        subtitle: 'So we know who to keep in the loop',
        shortTitle: 'About you',
        fields: [
          { id: 'your-name', label: 'Your name', placeholder: 'Bogdan Stevanović' },
          { id: 'relation', label: 'How you’re related', placeholder: 'Son' },
          { id: 'your-phone', label: 'Your phone number', placeholder: '+381 60 123 45 67' },
        ],
      },
      {
        id: 'household',
        type: 'single',
        title: 'Who else lives in the household?',
        subtitle: 'This tells us how much support is already around them',
        shortTitle: 'Household',
        options: [
          { id: 'alone', title: 'They live alone', description: 'Nobody else in the home' },
          { id: 'partner', title: 'With a partner', description: 'Two in the household' },
          { id: 'family', title: 'With family', description: 'Children or relatives in the home' },
          { id: 'crowded', title: 'Three or more others', description: 'A full household' },
        ],
      },
      {
        id: 'home-condition',
        type: 'single',
        title: 'How would you describe the state of the home?',
        subtitle: 'No judgement — it helps us know what a caregiver would walk into',
        shortTitle: 'Home condition',
        options: [
          { id: 'well-kept', title: 'Well kept', description: 'Clean and in good order' },
          { id: 'mostly-fine', title: 'Mostly fine', description: 'A little help would go a long way' },
          { id: 'needs-help', title: 'Needs help', description: 'Housework has been slipping' },
          { id: 'neglected', title: 'Badly neglected', description: 'It has become hard to manage at all' },
        ],
      },
    ],
  },

  {
    id: 'daily-life',
    intro:
      'Thank you. Now that we’ve met, I’d like to understand what daily life looks like for them today.',
    questions: [
      {
        id: 'mobility',
        type: 'single',
        title: 'How do they get around at the moment?',
        subtitle: 'Whatever is closest to a normal day',
        shortTitle: 'Getting around',
        options: [
          { id: 'independent', title: 'Completely on their own', short: 'Independent' },
          { id: 'stick', title: 'With a walking stick', short: 'Walking stick' },
          { id: 'walker', title: 'With a walking frame', short: 'Walking frame' },
          { id: 'wheelchair', title: 'Uses a wheelchair', short: 'Wheelchair' },
          { id: 'bed', title: 'Mostly stays in bed', short: 'In bed' },
        ],
      },
      {
        id: 'going-out',
        type: 'single',
        title: 'Can they leave the house on their own?',
        subtitle: 'Down the stairs, to the shop, that kind of thing',
        shortTitle: 'Leaving the house',
        options: [
          { id: 'easily', title: 'Without any trouble', short: 'No trouble' },
          { id: 'little-help', title: 'With a little help', short: 'A little help' },
          { id: 'accompanied', title: 'Only with someone with them', short: 'Accompanied' },
          { id: 'never-out', title: 'They don’t go out', short: 'Doesn’t go out' },
        ],
      },
      {
        id: 'daily-help',
        type: 'single',
        title: 'How much help do they need during the day?',
        subtitle: 'On an ordinary day, not a bad one',
        shortTitle: 'Help during the day',
        options: [
          { id: 'none', title: 'None at all', short: 'None' },
          { id: 'occasional', title: 'Now and then', short: 'Occasional' },
          { id: 'several-times', title: 'Several times a day', short: 'Several times' },
          { id: 'almost-constant', title: 'Almost constantly', short: 'Almost constant' },
          { id: 'dependent', title: 'They depend on someone else entirely', short: 'Dependent' },
        ],
      },
      {
        id: 'self-care',
        type: 'multi',
        // for a very frail person the honest answer is none of them, so this one
        // must be submittable empty
        allowEmpty: true,
        title: 'Which of these can they still do on their own?',
        subtitle: 'Tick everything they manage without help',
        shortTitle: 'Manages alone',
        options: [
          { id: 'dressing', title: 'Get dressed', short: 'Dressing' },
          { id: 'bathing', title: 'Wash or bathe', short: 'Bathing' },
          { id: 'toilet', title: 'Use the toilet', short: 'Toilet' },
          { id: 'meals', title: 'Prepare a meal', short: 'Meals' },
          { id: 'medication', title: 'Take their medication', short: 'Medication' },
        ],
      },
      {
        id: 'falls',
        type: 'single',
        title: 'Have they fallen in the past year?',
        subtitle: 'Including falls that didn’t cause an injury',
        shortTitle: 'Falls',
        options: [
          { id: 'none', title: 'Not once', short: 'No falls' },
          { id: 'once', title: 'Once', short: 'One fall' },
          { id: 'more-than-once', title: 'More than once', short: 'Several falls' },
        ],
      },
      {
        id: 'outdoors',
        type: 'single',
        title: 'How often do they get outside?',
        subtitle: 'Even just to sit in front of the building',
        shortTitle: 'Getting outside',
        options: [
          { id: 'daily', title: 'Almost every day', short: 'Daily' },
          { id: 'weekly', title: 'A few times a week', short: 'Weekly' },
          { id: 'rarely', title: 'Rarely', short: 'Rarely' },
          { id: 'never', title: 'Never', short: 'Never' },
        ],
      },
      {
        id: 'slowing',
        type: 'single',
        title: 'Have they noticeably slowed down these past months?',
        subtitle: 'Compared with how they were a year ago',
        shortTitle: 'Slowing down',
        options: [
          { id: 'no', title: 'Not really', short: 'No change' },
          { id: 'little', title: 'A little', short: 'A little' },
          { id: 'lot', title: 'Quite a lot', short: 'A lot' },
        ],
      },
      {
        id: 'overall',
        type: 'single',
        title: 'How would you describe them overall?',
        subtitle: 'Your own words matter more than you think',
        shortTitle: 'Overall state',
        options: [
          { id: 'active', title: 'Fully active', short: 'Fully active' },
          { id: 'independent', title: 'Mostly independent', short: 'Mostly independent' },
          { id: 'house-help', title: 'Needs help around the house', short: 'Help at home' },
          { id: 'most-help', title: 'Needs help with most things', short: 'Help with most' },
          { id: 'dependent', title: 'Depends on others for almost everything', short: 'Dependent' },
        ],
      },
    ],
  },

  {
    id: 'support',
    intro:
      'That gives me a clear picture. A few more questions and the recommendation will be precise.',
    questions: [
      // ---- light: frailty 1–3, no medical detail needed ----
      {
        id: 'lifestyle',
        type: 'multi',
        when: ({ band }) => band === 'light',
        title: 'What would make the biggest difference right now?',
        subtitle: 'Pick anything that would help them stay as they are',
        shortTitle: 'What would help',
        options: [
          { id: 'company', title: 'Company and conversation', short: 'Company' },
          { id: 'activities', title: 'Getting out to social activities', short: 'Activities' },
          { id: 'transport', title: 'Transport to appointments', short: 'Transport' },
          { id: 'exercise', title: 'Staying physically active', short: 'Exercise' },
          { id: 'prevention', title: 'Regular check-ups and prevention', short: 'Prevention' },
          { id: 'wellness', title: 'Wellness — massage, physio, care', short: 'Wellness' },
        ],
      },

      // ---- moderate: frailty 4–5, who does the housework ----
      {
        id: 'household-tasks',
        type: 'multi',
        when: ({ band }) => band === 'moderate',
        title: 'You said they need a hand around the house. Which of these?',
        subtitle: 'Tick whatever has become difficult',
        shortTitle: 'Around the house',
        options: [
          { id: 'cooking', title: 'Cooking', short: 'Cooking' },
          { id: 'laundry', title: 'Laundry', short: 'Laundry' },
          { id: 'shopping', title: 'Shopping', short: 'Shopping' },
          { id: 'cleaning', title: 'Cleaning and tidying', short: 'Cleaning' },
          { id: 'meds-admin', title: 'Keeping track of medication', short: 'Medication' },
        ],
      },
      {
        id: 'who-helps-now',
        type: 'single',
        when: ({ band }) => band === 'moderate',
        title: 'Who is doing those things at the moment?',
        subtitle: 'It helps to know what we’d be relieving',
        shortTitle: 'Who helps now',
        options: [
          { id: 'family', title: 'Family, when they can', short: 'Family' },
          { id: 'neighbour', title: 'A neighbour or friend', short: 'Neighbour' },
          { id: 'paid', title: 'Someone paid privately', short: 'Paid help' },
          { id: 'nobody', title: 'Nobody — it’s not getting done', short: 'Nobody' },
        ],
      },

      // ---- high: frailty 6, personal care ----
      {
        id: 'personal-care',
        type: 'multi',
        when: ({ band }) => band === 'high',
        title: 'Where do they need hands-on help?',
        subtitle: 'Tick everything that applies today',
        shortTitle: 'Personal care',
        options: [
          { id: 'bathing', title: 'Bathing', short: 'Bathing' },
          { id: 'dressing', title: 'Dressing', short: 'Dressing' },
          { id: 'transfer', title: 'Getting in and out of bed or a chair', short: 'Transfers' },
          { id: 'stairs', title: 'Stairs', short: 'Stairs' },
          { id: 'incontinence', title: 'Incontinence', short: 'Incontinence' },
          { id: 'night-toilet', title: 'Getting to the toilet at night', short: 'Night toilet' },
        ],
      },
      {
        id: 'fall-risk',
        type: 'single',
        when: ({ band }) => band === 'high',
        title: 'How worried are you about a fall?',
        subtitle: 'Your instinct is usually right',
        shortTitle: 'Fall risk',
        options: [
          { id: 'low', title: 'Not especially', short: 'Low' },
          { id: 'medium', title: 'It’s on my mind', short: 'Medium' },
          { id: 'high', title: 'Very — it feels like a matter of time', short: 'High' },
        ],
      },

      // ---- severe: frailty 7–8, nursing territory ----
      {
        id: 'bed-mobility',
        type: 'single',
        when: ({ band }) => band === 'severe',
        title: 'Can they change position in bed on their own?',
        subtitle: 'Turning over, sitting up',
        shortTitle: 'Moving in bed',
        options: [
          { id: 'yes', title: 'Yes, on their own', short: 'On their own' },
          { id: 'some-help', title: 'With some help', short: 'Some help' },
          { id: 'full-help', title: 'They need to be turned', short: 'Needs turning' },
        ],
      },
      {
        id: 'eating',
        type: 'single',
        when: ({ band }) => band === 'severe',
        title: 'How do they manage with eating?',
        subtitle: 'Including any trouble swallowing',
        shortTitle: 'Eating',
        options: [
          { id: 'alone', title: 'Eats on their own', short: 'Eats alone' },
          { id: 'help', title: 'Needs help with the meal', short: 'Needs help' },
          { id: 'fed', title: 'Needs to be fed', short: 'Needs feeding' },
          { id: 'swallowing', title: 'Has trouble swallowing', short: 'Swallowing trouble' },
        ],
      },
      {
        id: 'pressure-sores',
        type: 'single',
        when: ({ band }) => band === 'severe',
        title: 'Are there any pressure sores?',
        subtitle: 'This decides whether a nurse needs to be involved',
        shortTitle: 'Pressure sores',
        options: [
          { id: 'none', title: 'None', short: 'None' },
          { id: 'early', title: 'Redness or a shallow sore', short: 'Early stage' },
          { id: 'deep', title: 'A deep or open wound', short: 'Deep wound' },
          { id: 'unsure', title: 'I’m not sure', short: 'Unsure' },
        ],
      },
      {
        id: 'respiratory',
        type: 'multi',
        when: ({ band }) => band === 'severe',
        title: 'Is there any breathing support at home?',
        subtitle: 'Leave it empty if there isn’t',
        shortTitle: 'Breathing support',
        options: [
          { id: 'oxygen', title: 'Oxygen', short: 'Oxygen' },
          { id: 'cpap', title: 'CPAP', short: 'CPAP' },
          { id: 'suction', title: 'Suction', short: 'Suction' },
          { id: 'none', title: 'None of these', short: 'None' },
        ],
      },

      // ---- palliative: frailty 9 ----
      {
        id: 'palliative-needs',
        type: 'multi',
        when: ({ band }) => band === 'palliative',
        title: 'What would help the family most right now?',
        subtitle: 'We’ll put a coordinator alongside you either way',
        shortTitle: 'Support needed',
        options: [
          { id: 'nursing', title: 'A nurse who visits regularly', short: 'Nursing' },
          { id: 'round-clock', title: 'Round-the-clock care at home', short: '24/7 care' },
          { id: 'medication', title: 'Medication delivered to the home', short: 'Medication' },
          { id: 'equipment', title: 'Equipment and supplies', short: 'Equipment' },
          { id: 'spiritual', title: 'Spiritual support', short: 'Spiritual' },
          { id: 'family', title: 'Support for the family', short: 'Family support' },
        ],
      },
    ],
  },

  {
    id: 'reason',
    intro: 'One last thing, and it’s the one that matters most — why did you get in touch today?',
    questions: [
      {
        id: 'reason-for-contact',
        type: 'single',
        title: 'What brought you to us?',
        subtitle: 'The closest one is fine',
        shortTitle: 'Reason for contact',
        options: [
          { id: 'fall', title: 'They had a fall', short: 'Fall' },
          { id: 'memory', title: 'Their memory is changing', short: 'Memory' },
          { id: 'discharge', title: 'They’re coming home from hospital', short: 'Discharge' },
          { id: 'loneliness', title: 'They’re alone too much', short: 'Loneliness' },
          { id: 'medication', title: 'Medication is getting hard to manage', short: 'Medication' },
          { id: 'diagnosis', title: 'A diagnosis — stroke, Parkinson’s, cancer', short: 'Diagnosis' },
          { id: 'home-help', title: 'The house has become too much', short: 'Home help' },
          { id: 'respite', title: 'The family needs a break', short: 'Respite' },
          { id: 'daily-living', title: 'Day-to-day life needs support', short: 'Daily living' },
        ],
      },
      {
        id: 'onset',
        type: 'single',
        title: 'Did it come on suddenly or gradually?',
        subtitle: 'Sudden changes usually need a different response',
        shortTitle: 'How it started',
        options: [
          { id: 'sudden', title: 'Suddenly, in the last days or weeks', short: 'Suddenly' },
          { id: 'gradual', title: 'Gradually, over months', short: 'Gradually' },
          { id: 'long-standing', title: 'It’s been this way a long time', short: 'Long-standing' },
        ],
      },
      {
        id: 'hospitalisation',
        type: 'single',
        title: 'Has there been a hospital stay?',
        subtitle: 'Recent discharges change what we arrange first',
        shortTitle: 'Hospital stay',
        options: [
          { id: 'recent', title: 'Yes, in the last month', short: 'Recent' },
          { id: 'older', title: 'Yes, but a while ago', short: 'A while ago' },
          { id: 'none', title: 'No', short: 'None' },
        ],
      },
      {
        id: 'family-goal',
        type: 'inputs',
        title: 'What would a good outcome look like for you?',
        subtitle: 'In your own words — this shapes everything we suggest',
        shortTitle: 'Your goal',
        fields: [
          {
            id: 'goal',
            label: 'What you’re hoping for',
            placeholder: 'That she can stay at home safely',
          },
          {
            id: 'worry',
            label: 'What worries you most',
            placeholder: 'That she falls again while I’m at work',
            optional: true,
          },
        ],
      },
    ],
  },
];

// Frailty is estimated from the second section, so branching questions can only be
// resolved once those answers exist.
export function flowContext(answers, level) {
  return { level: level ?? null, band: level ? bandOf(level) : null };
}

export function questionApplies(question, ctx) {
  if (!question.when) return true;
  if (!ctx.band) return false; // not enough answered to know which branch yet
  return question.when(ctx);
}

export function applicableQuestions(step, ctx) {
  return step.questions.filter((q) => questionApplies(q, ctx));
}

export const questions = steps.flatMap((s) => s.questions);

export const questionById = Object.fromEntries(questions.map((q) => [q.id, q]));

// Titles of the picked option(s) for a question, used to summarise answers.
export function optionTitles(questionId, answer) {
  const q = questionById[questionId];
  if (!q || !answer) return [];
  if (q.type === 'single') {
    return q.options.filter((o) => o.id === answer.optionId).map((o) => o.title);
  }
  if (q.type === 'multi') {
    return q.options.filter((o) => answer.optionIds?.includes(o.id)).map((o) => o.title);
  }
  return [];
}
