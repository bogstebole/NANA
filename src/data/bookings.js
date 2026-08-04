import { caregivers } from './carePlan';

// Requests the user has sent out. Statuses drive the dashboard: a caregiver has
// either accepted, not answered yet, or declined — and a decline always carries
// a reason, so the user is never left guessing.
export const bookings = [
  {
    caregiverId: 'vesna',
    status: 'accepted',
    requested: '2 days ago',
    detail: 'Starts Monday 11 August, 08:00–14:00. Trial week agreed.',
  },
  {
    caregiverId: 'snezana',
    status: 'pending',
    requested: '1 day ago',
    detail: 'Usually replies within 48 hours.',
  },
  {
    caregiverId: 'gordana',
    status: 'pending',
    requested: '4 hours ago',
    detail: 'We’ve sent your request and the schedule you selected.',
  },
  {
    caregiverId: 'dragana',
    status: 'declined',
    requested: '3 days ago',
    detail: 'Already committed to another family on Mondays and Thursdays until October.',
  },
];

export const STATUS_LABEL = {
  accepted: 'Accepted',
  pending: 'Waiting for reply',
  declined: 'Declined',
};

export function bookingsWithCaregiver() {
  return bookings.map((b) => ({
    ...b,
    caregiver: caregivers.find((c) => c.id === b.caregiverId),
  }));
}

export function statusCounts() {
  return bookings.reduce(
    (acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }),
    { accepted: 0, pending: 0, declined: 0 }
  );
}

