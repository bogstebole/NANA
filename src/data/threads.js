// Past conversations. A thread keeps what the chat concluded — the summary, the
// facts it collected and anything said afterwards — rather than a full replay.
export const seedThreads = [
  {
    id: 'may',
    title: 'Moving the visits to afternoons',
    date: '12 May 2026',
    summary:
      'Milica needed daytime visits three days a week, mainly with meals and companionship. We matched 4 caregivers in and around Vračar.',
    facts: [
      { label: 'Care for', value: 'Milica Stevanović' },
      { label: 'Schedule', value: 'Daily visits / shifts' },
      { label: 'Days', value: '3 per week' },
      { label: 'Time of day', value: 'Afternoon' },
      { label: 'Mobility', value: 'Needs some support' },
      { label: 'Conditions', value: 'High blood pressure' },
    ],
    caregivers: 4,
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
      'First plan after Milica came home. Short daily check-ins while she recovered, with medication reminders twice a day and help with meals.',
    facts: [
      { label: 'Care for', value: 'Milica Stevanović' },
      { label: 'Schedule', value: 'Occasional help' },
      { label: 'Days', value: '7 per week' },
      { label: 'Time of day', value: 'Morning' },
      { label: 'Mobility', value: 'Mostly in bed' },
      { label: 'Conditions', value: 'Recovering after surgery' },
    ],
    caregivers: 3,
    messages: [
      { role: 'user', text: 'How soon can someone start?' },
      {
        role: 'assistant',
        text: 'Two of the three can start within 48 hours. I’ve flagged your request as urgent so they see it first.',
      },
    ],
  },
];
