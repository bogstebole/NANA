// Past conversations. A thread keeps the answers it collected, so opening it
// replays the same question cards the live chat renders — just read only.
export const seedThreads = [
  {
    id: 'may',
    title: 'Moving the visits to afternoons',
    date: '12 May 2026',
    summary:
      'Milica needed daytime visits three days a week, mainly with meals and companionship. We matched 4 caregivers in and around Vračar.',
    caregivers: 4,
    answers: {
      'basic-info': {
        values: {
          name: 'Milica Stevanović',
          dob: '04-08-1941',
          address: 'Južni bulevar 12, Beograd',
          phone: '+381 63 555 210',
        },
      },
      'care-schedule': { optionId: 'daily' },
      'care-days': { optionIds: ['mon', 'wed', 'fri'] },
      'care-time': { optionIds: ['afternoon'] },
      'primary-contact': {
        values: {
          'contact-name': 'Bogdan Stevanović',
          relation: 'Son',
          'contact-phone': '+381 63 555 210',
        },
      },
      'contact-preference': { optionId: 'emergencies' },
      'doctor-info': {
        values: {
          'doctor-name': 'Dr Jovana Perić',
          clinic: 'Dom zdravlja Vračar',
          'doctor-phone': '+381 11 344 2100',
        },
      },
      tasks: { optionIds: ['meals', 'companionship'] },
      mobility: { optionId: 'some-support' },
      routine: {
        values: { 'morning-routine': 'Lunch around 13:00, short walk after', habits: 'Afternoon nap' },
      },
      conditions: { optionIds: ['pressure'] },
      'medication-handling': { optionId: 'reminders' },
      allergies: { values: { 'allergy-list': 'None known', diet: 'Low salt' } },
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
      'First plan after Milica came home. Daily check-ins while she recovered, with medication given by the caregiver and help with meals.',
    caregivers: 3,
    answers: {
      'basic-info': {
        values: {
          name: 'Milica Stevanović',
          dob: '04-08-1941',
          address: 'Južni bulevar 12, Beograd',
          phone: '+381 63 555 210',
        },
      },
      'care-schedule': { optionId: 'occasional' },
      'care-days': { optionIds: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
      'care-time': { optionIds: ['morning'] },
      'primary-contact': {
        values: {
          'contact-name': 'Bogdan Stevanović',
          relation: 'Son',
          'contact-phone': '+381 63 555 210',
        },
      },
      'contact-preference': { optionId: 'all-updates' },
      'doctor-info': {
        values: {
          'doctor-name': 'Dr Jovana Perić',
          clinic: 'Dom zdravlja Vračar',
          'doctor-phone': '+381 11 344 2100',
        },
      },
      tasks: { optionIds: ['personal-care', 'meals', 'medication'] },
      mobility: { optionId: 'bedridden' },
      routine: {
        values: { 'morning-routine': 'Dressing change, breakfast at 9', habits: 'Goes to bed early' },
      },
      conditions: { optionIds: ['pressure'] },
      'medication-handling': { optionId: 'administered' },
      allergies: { values: { 'allergy-list': 'Penicillin', diet: 'Soft food' } },
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
