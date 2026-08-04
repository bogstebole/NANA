// Onboarding content. Steps are delivered as chat messages, one after the other.
// Question types:
//  - inputs: several free-text fields inside one card (Next button)
//  - single: pick one option, auto-advances
//  - multi:  pick several options, confirm with Next
export const steps = [
  {
    id: 'elderly-profile',
    intro: 'Let’s get started. First, we need few information about an elderly person.',
    questions: [
      {
        id: 'basic-info',
        type: 'inputs',
        title: 'Let’s start with the basic info first',
        subtitle: 'Tell us who the care is for — this helps us find the right caregiver',
        shortTitle: 'Basic info',
        fields: [
          { id: 'name', label: 'Elderly full name', placeholder: 'Write what you want...' },
          { id: 'dob', label: 'Date of birth', placeholder: 'mm-dd-yyyy' },
          { id: 'address', label: 'Address', placeholder: 'South street 123, Belgrade' },
          { id: 'phone', label: 'Phone number', placeholder: '+381 60 123 45 67' },
        ],
      },
      {
        id: 'care-schedule',
        type: 'single',
        title: 'When is caregiver needed?',
        subtitle: 'How often should the caregiver be at your elderly person place',
        shortTitle: 'When is caregiver needed?',
        options: [
          {
            id: 'daily',
            title: 'Daily visits / shifts',
            description: 'Engagement at agreed times (e.g. 4h or 8h), without overnight stays',
          },
          {
            id: '24h',
            title: '24h shift',
            description: 'The shift lasts continuously 24 hours (whole day and night)',
          },
          {
            id: 'occasional',
            title: 'Occasional help',
            description: 'A few visits per week, or only when the family is away',
          },
        ],
      },
      {
        id: 'care-days',
        type: 'multi',
        title: 'Which days do you need a caregiver?',
        subtitle: 'Select every day that applies',
        shortTitle: 'Which days do you need a caregiver?',
        options: [
          { id: 'mon', title: 'Monday', short: 'Mon' },
          { id: 'tue', title: 'Tuesday', short: 'Tue' },
          { id: 'wed', title: 'Wednesday', short: 'Wed' },
          { id: 'thu', title: 'Thursday', short: 'Thu' },
          { id: 'fri', title: 'Friday', short: 'Fri' },
          { id: 'sat', title: 'Saturday', short: 'Sat' },
          { id: 'sun', title: 'Sunday', short: 'Sun' },
        ],
      },
      {
        id: 'care-time',
        type: 'multi',
        title: 'Which part of the day you need a caregiver?',
        subtitle: 'Select the time your elderly person needs assistance',
        shortTitle: 'Part of the day',
        options: [
          { id: 'morning', title: 'Morning', description: '08:00 - 14:00', short: 'Morning' },
          { id: 'afternoon', title: 'Afternoon', description: '14:00 - 20:00', short: 'Afternoon' },
          { id: 'overnight', title: 'Overnight', description: '20:00 - 08:00', short: 'Overnight' },
        ],
      },
    ],
  },
  {
    id: 'emergency-contacts',
    intro:
      'That’s the profile sorted. Now — who should we reach out to when something needs attention?',
    questions: [
      {
        id: 'primary-contact',
        type: 'inputs',
        title: 'Who is the primary contact?',
        subtitle: 'This person will be contacted first for updates and urgent matters',
        shortTitle: 'Primary contact',
        fields: [
          { id: 'contact-name', label: 'Full name', placeholder: 'Write what you want...' },
          { id: 'relation', label: 'Relation to elderly', placeholder: 'e.g. Daughter, Son, Neighbor' },
          { id: 'contact-phone', label: 'Phone number', placeholder: '+381 60 123 45 67' },
        ],
      },
      {
        id: 'contact-preference',
        type: 'single',
        title: 'In which situations should we call?',
        subtitle: 'You can always change this later in your settings',
        shortTitle: 'When to call',
        options: [
          {
            id: 'emergencies',
            title: 'Emergencies only',
            description: 'Only urgent health or safety concerns',
          },
          {
            id: 'all-updates',
            title: 'All updates',
            description: 'Daily reports and any schedule changes',
          },
          {
            id: 'schedule',
            title: 'Schedule changes',
            description: 'Only when visits are rescheduled or cancelled',
          },
        ],
      },
      {
        id: 'doctor-info',
        type: 'inputs',
        title: 'Is there a doctor we should know about?',
        subtitle: 'The caregiver will have this at hand in case of a medical situation',
        shortTitle: 'Doctor info',
        fields: [
          { id: 'doctor-name', label: 'Doctor’s name', placeholder: 'Write what you want...' },
          { id: 'clinic', label: 'Clinic / practice', placeholder: 'e.g. Health center Vračar', optional: true },
          { id: 'doctor-phone', label: 'Phone number', placeholder: '+381 11 123 45 67', optional: true },
        ],
      },
    ],
  },
  {
    id: 'caregiver-tasks',
    intro:
      'Good. Next, tell me what kind of help your loved one needs day to day — this is what shapes the caregiver’s routine.',
    questions: [
      {
        id: 'tasks',
        type: 'multi',
        title: 'What should the caregiver help with?',
        subtitle: 'Select everything that applies — this shapes the daily routine',
        shortTitle: 'Daily tasks',
        options: [
          {
            id: 'personal-care',
            title: 'Personal care',
            description: 'Bathing, dressing and personal hygiene',
            short: 'Personal care',
          },
          {
            id: 'meals',
            title: 'Meal preparation',
            description: 'Cooking and help with feeding',
            short: 'Meals',
          },
          {
            id: 'medication',
            title: 'Medication reminders',
            description: 'Making sure medication is taken on time',
            short: 'Medication',
          },
          {
            id: 'household',
            title: 'Household help',
            description: 'Light cleaning, laundry and groceries',
            short: 'Household',
          },
          {
            id: 'companionship',
            title: 'Companionship',
            description: 'Conversation, walks and social time',
            short: 'Companionship',
          },
        ],
      },
      {
        id: 'mobility',
        type: 'single',
        title: 'How mobile is your elderly person?',
        subtitle: 'This helps us match caregivers with the right experience',
        shortTitle: 'Mobility',
        options: [
          {
            id: 'mobile',
            title: 'Fully mobile',
            description: 'Moves independently, no assistance needed',
          },
          {
            id: 'some-support',
            title: 'Needs some support',
            description: 'Uses a cane or walker, needs help occasionally',
          },
          {
            id: 'wheelchair',
            title: 'Uses a wheelchair',
            description: 'Needs help with transfers and moving around',
          },
          {
            id: 'bedridden',
            title: 'Mostly in bed',
            description: 'Requires full assistance with movement',
          },
        ],
      },
      {
        id: 'routine',
        type: 'inputs',
        title: 'Anything specific about the daily routine?',
        subtitle: 'Small habits matter — they help the caregiver settle in faster',
        shortTitle: 'Daily routine',
        fields: [
          { id: 'morning-routine', label: 'Morning routine', placeholder: 'e.g. Breakfast at 8, short walk at 10' },
          { id: 'habits', label: 'Important habits', placeholder: 'e.g. Afternoon nap, evening news', optional: true },
        ],
      },
    ],
  },
  {
    id: 'health-condition',
    intro: 'Almost done. A few health details so the caregiver comes prepared.',
    questions: [
      {
        id: 'conditions',
        type: 'multi',
        title: 'Any diagnosed conditions we should know about?',
        subtitle: 'Shared only with the caregiver you choose',
        shortTitle: 'Conditions',
        options: [
          { id: 'dementia', title: 'Dementia / Alzheimer’s', short: 'Dementia' },
          { id: 'diabetes', title: 'Diabetes', short: 'Diabetes' },
          { id: 'heart', title: 'Heart condition', short: 'Heart' },
          { id: 'pressure', title: 'High blood pressure', short: 'Blood pressure' },
          { id: 'senses', title: 'Limited hearing or vision', short: 'Hearing/vision' },
          { id: 'none', title: 'None of these', short: 'None' },
        ],
      },
      {
        id: 'medication-handling',
        type: 'single',
        title: 'How is medication handled?',
        subtitle: 'So the caregiver knows exactly what is expected',
        shortTitle: 'Medication',
        options: [
          {
            id: 'independent',
            title: 'Independently',
            description: 'Takes medication without help',
          },
          {
            id: 'reminders',
            title: 'Needs reminders',
            description: 'The caregiver should remind and check',
          },
          {
            id: 'administered',
            title: 'Caregiver administers',
            description: 'The caregiver prepares and gives medication',
          },
        ],
      },
      {
        id: 'allergies',
        type: 'inputs',
        title: 'Allergies or dietary restrictions?',
        subtitle: 'The caregiver will respect these when preparing meals',
        shortTitle: 'Allergies & diet',
        fields: [
          { id: 'allergy-list', label: 'Allergies', placeholder: 'e.g. Penicillin, peanuts' },
          { id: 'diet', label: 'Dietary restrictions', placeholder: 'e.g. Low sugar, no salt', optional: true },
        ],
      },
    ],
  },
];

// The chat asks everything in a single section, so the grouping above is only
// there to keep the content readable while editing it.
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
