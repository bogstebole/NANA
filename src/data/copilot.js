import { statusCounts } from './bookings';

// The assistant panel is contextual: what it opens with, what it suggests and how
// it answers all depend on the page it was opened from.
export function copilotContext(view, { plan, unlocked } = {}) {
  const counts = statusCounts();
  const name = plan?.firstName || 'your loved one';

  switch (view) {
    case 'dashboard':
      return {
        label: 'Dashboard',
        opening: unlocked
          ? `${counts.pending} requests are still waiting and Dragana declined. Want me to chase the quiet ones, or find someone to replace her?`
          : 'Once you request a caregiver, I can track the replies here and chase anyone who goes quiet.',
        suggestions: unlocked
          ? ['Chase the pending requests', 'Find a replacement for Dragana', 'When does Vesna start?']
          : ['How does requesting work?', 'What happens after someone accepts?'],
        replies: [
          'I’ve nudged Snežana and Gordana. Caregivers usually reply within 48 hours — I’ll flag it here the moment either of them does.',
          'Ljiljana and Mirjana both cover Mondays and Thursdays, which is where Dragana fell through. Shall I send them the same request?',
          'Vesna starts Monday 11 August at 08:00, with the first week agreed as a trial.',
        ],
      };
    case 'plans':
      return {
        label: 'Care plans',
        opening: plan
          ? `This plan is for ${name}. I can compare it with the older ones, or adjust the schedule and rebuild the matches.`
          : 'There’s no active plan yet. Finish the questions in the chat and I’ll build one.',
        suggestions: ['Compare with the May plan', 'Change the schedule', 'Why these caregivers?'],
        replies: [
          'The May plan was three afternoons a week with meals and companionship. This one adds medication reminders and one more day — which is why two of the earlier caregivers no longer fit.',
          'Tell me the days and hours you want and I’ll rework the plan, then re-rank the caregivers against it.',
          `They were ranked on schedule overlap, the tasks you picked and distance from ${name}’s address. Vesna scores highest because she has done exactly this combination before.`,
        ],
      };
    case 'profile':
      return {
        label: 'Profile',
        opening: `I can update ${name}’s details, change the emergency contact, or add a doctor.`,
        suggestions: ['Update the address', 'Change the emergency contact', 'Add a second contact'],
        replies: [
          'Tell me the new address and I’ll update the profile — I’ll also re-check which caregivers are still nearby.',
          'Who should we call first instead? I’ll swap them in and let the caregivers know.',
          'A second contact is a good idea for the days you’re away. Give me a name and number.',
        ],
      };
    case 'settings':
      return {
        label: 'Settings',
        opening: unlocked
          ? 'Your subscription is active. I can explain what it covers or help you pause it.'
          : 'You’re not subscribed yet, so caregiver numbers and the recommendations stay locked.',
        suggestions: ['What does the subscription cover?', 'How do I pause it?', 'Which notifications matter?'],
        replies: [
          'It covers the direct numbers for every matched caregiver, the doctor recommendations and the suggested aids — one payment a month, cancel any time.',
          'You can pause from Manage billing. Your plan and caregivers stay saved, you just lose the contact details until you resume.',
          'Keep caregiver replies and schedule changes on. The weekly digest is optional — most families turn it off once a caregiver has settled in.',
        ],
      };
    default:
      return {
        label: 'Chat',
        opening: 'Ask me anything about the plan, the caregivers, or how NANA Prime works.',
        suggestions: ['How are caregivers vetted?', 'What does it cost?'],
        replies: [
          'Every caregiver is interviewed by our team and background-checked before they appear in a plan.',
          'Caregivers are paid per hour at the rate on their card, settled through NANA Prime rather than in cash.',
        ],
      };
  }
}
