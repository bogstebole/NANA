import { CFS } from './frailty';

// The caregiver's side of the same product. A family sends a request; from the
// caregiver's desk that request is a piece of work that moves through four
// stages, and the only question the board has to answer at a glance is "what
// needs me next, and for whom".
//
// Each family sits in exactly one column, and the column is not a label on them
// — it is the next thing the caregiver owes them. A family with a visit to
// invoice is in Work orders even though the arrangement is perfectly active,
// because the invoice is what is outstanding. When it is sent they go back to
// Active. That is why the board can be read without reading any card.

export const STAGES = [
  {
    id: 'request',
    title: 'New requests',
    note: 'Accept or decline',
  },
  {
    id: 'agreement',
    title: 'Care agreement',
    note: 'Which services, and one hourly rate',
  },
  {
    id: 'active',
    title: 'Active',
    note: 'Arrangement running',
  },
  {
    id: 'work-order',
    title: 'Work orders',
    note: 'Send after every visit',
  },
];

// Belgrade, dinars, the same families the rest of the app talks about — the
// screenshots that prompted this view were euros and Finnish names from another
// product, and this one has its own.
export const money = (n) => `${n.toLocaleString('sr-RS').replace(/,/g, '.')} RSD`;

export const clients = [
  {
    id: 'stevanovic',
    elder: 'Milica Stevanović',
    age: 84,
    initials: 'MS',
    family: 'Bogdan Stevanović',
    relation: 'Son',
    area: 'Vračar',
    distance: '1.8 km',
    frailty: 5,
    needs: ['Medication', 'Meals', 'Company'],
    hours: 12,
    schedule: 'Mon, Wed, Fri · 09:00–13:00',
    stage: 'request',
    waitingDays: 2,
    startsOn: 'Monday 18 August',
  },
  {
    id: 'pavlovic',
    elder: 'Đorđe Pavlović',
    age: 79,
    initials: 'ĐP',
    family: 'Jelena Pavlović',
    relation: 'Daughter',
    area: 'Zvezdara',
    distance: '3.2 km',
    frailty: 6,
    needs: ['Personal care', 'Mobility', 'Meals'],
    hours: 20,
    schedule: 'Every weekday · 08:00–12:00',
    stage: 'request',
    waitingHours: 4,
    startsOn: 'As soon as possible',
  },
  {
    id: 'jovanovic',
    elder: 'Radmila Jovanović',
    age: 88,
    initials: 'RJ',
    family: 'Nevena Jovanović',
    relation: 'Granddaughter',
    area: 'Vračar',
    distance: '1.1 km',
    frailty: 6,
    needs: ['Personal care', 'Meals', 'Housekeeping'],
    hours: 15,
    schedule: 'Mon–Thu · 09:00–13:00',
    stage: 'agreement',
    agreementSent: false,
    acceptedOn: 'yesterday',
  },
  {
    id: 'maric',
    elder: 'Vojislav Marić',
    age: 81,
    initials: 'VM',
    family: 'Aleksandar Marić',
    relation: 'Son',
    area: 'Savski venac',
    distance: '4.6 km',
    frailty: 4,
    needs: ['Company', 'Errands', 'Walks'],
    hours: 8,
    schedule: 'Tue, Thu · 10:00–14:00',
    stage: 'agreement',
    agreementSent: true,
    sentOn: '2 days ago',
    rate: 850,
  },
  {
    id: 'ilic',
    elder: 'Zorka Ilić',
    age: 86,
    initials: 'ZI',
    family: 'Milena Ilić',
    relation: 'Daughter',
    area: 'Vračar',
    distance: '2.0 km',
    frailty: 5,
    needs: ['Medication', 'Meals', 'Company'],
    hours: 12,
    schedule: 'Mon, Wed, Fri · 09:00–13:00',
    stage: 'active',
    rate: 850,
    since: '12 June',
    nextVisit: 'Tomorrow · 09:00–13:00',
    visitHours: 4,
  },
  {
    id: 'nikolic',
    elder: 'Branko Nikolić',
    age: 90,
    initials: 'BN',
    family: 'Dušan Nikolić',
    relation: 'Son',
    area: 'Zvezdara',
    distance: '3.8 km',
    frailty: 7,
    needs: ['Personal care', 'Mobility', 'Medication'],
    hours: 9,
    schedule: 'Tue, Thu, Sat · 10:00–13:00',
    stage: 'active',
    rate: 900,
    since: '3 March',
    nextVisit: 'Thursday · 10:00–13:00',
    visitHours: 3,
  },
  {
    id: 'petrovic',
    elder: 'Ljubica Petrović',
    age: 83,
    initials: 'LJP',
    family: 'Marko Petrović',
    relation: 'Son',
    area: 'Vračar',
    distance: '1.4 km',
    frailty: 5,
    needs: ['Meals', 'Housekeeping', 'Company'],
    hours: 9,
    schedule: 'Mon, Wed, Fri · 09:00–12:00',
    stage: 'work-order',
    rate: 850,
    since: '4 May',
    visit: { date: 'Yesterday', time: '09:00–12:00', hours: 3 },
    dueInHours: 2,
    nextVisit: 'Friday · 09:00–12:00',
    visitHours: 3,
  },
  {
    id: 'djuric',
    elder: 'Slavko Đurić',
    age: 77,
    initials: 'SĐ',
    family: 'Tanja Đurić',
    relation: 'Daughter',
    area: 'Palilula',
    distance: '5.1 km',
    frailty: 4,
    needs: ['Company', 'Walks', 'Errands'],
    hours: 12,
    schedule: 'Mon, Thu · 08:00–14:00',
    stage: 'work-order',
    rate: 800,
    since: '20 July',
    visit: { date: '9 August', time: '08:00–14:00', hours: 6 },
    dueInHours: 19,
    nextVisit: 'Monday · 08:00–14:00',
    visitHours: 6,
  },
];

// What the caregiver has already been paid this month, before anything on the
// board is sent. The work-order column is money not yet asked for, which is the
// reason it sits on the board at all.
export const paidThisMonth = 38400;

export const frailtyLabel = (level) => CFS[level]?.label || '';

// A work order is the visit's hours at the agreed rate, less the platform's
// 10% — the caregiver's number is what lands, not what is charged.
export const SERVICE_FEE = 0.1;

export function workOrderTotals(client) {
  const charged = client.visit.hours * client.rate;
  const fee = Math.round(charged * SERVICE_FEE);
  return { charged, fee, net: charged - fee };
}

// What each column is worth to her, which is not the same question as how many
// cards are in it.
export function boardSummary(list) {
  const at = (stage) => list.filter((c) => c.stage === stage);
  const requests = at('request');
  const toSend = at('agreement').filter((c) => !c.agreementSent);
  const workOrders = at('work-order');

  return {
    requests: requests.length,
    // the oldest request is the one that makes waiting look like being ignored
    oldestRequest: requests.reduce(
      (worst, c) => Math.max(worst, c.waitingDays ? c.waitingDays * 24 : c.waitingHours || 0),
      0
    ),
    toSend: toSend.length,
    active: at('active').length,
    workOrders: workOrders.length,
    // the soonest deadline, because these charge themselves after 24 hours
    soonestDue: workOrders.reduce(
      (soonest, c) => Math.min(soonest, c.dueInHours ?? Infinity),
      Infinity
    ),
    outstanding: workOrders.reduce((sum, c) => sum + workOrderTotals(c).net, 0),
  };
}
