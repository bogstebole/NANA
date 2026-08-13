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
  { id: 'request', title: 'New requests', note: 'Accept or decline' },
  { id: 'agreement', title: 'Care agreement', note: 'Which services, and one hourly rate' },
  { id: 'active', title: 'Active', note: 'Arrangement running' },
  { id: 'work-order', title: 'Work orders', note: 'Send after every visit' },
];

// The services an agreement can cover. One closed list, because the agreement
// is what every later number is calculated from — a visit is billed against
// these, so they cannot be free text. `short` is what fits on a board card.
export const SERVICES = [
  { id: 'personal-care', title: 'Personal care and hygiene', short: 'Personal care' },
  { id: 'meals', title: 'Meal preparation', short: 'Meals' },
  { id: 'medication', title: 'Medication reminders', short: 'Medication' },
  { id: 'company', title: 'Companionship', short: 'Company' },
  { id: 'errands', title: 'Shopping and errands', short: 'Errands' },
  { id: 'housekeeping', title: 'Light housekeeping', short: 'Housekeeping' },
  { id: 'walks', title: 'Walks and outdoor time', short: 'Walks' },
  // Not on the client's draft list, but the care plan on the family's side asks
  // about mobility support and someone at CFS 7 is mostly that.
  { id: 'mobility', title: 'Mobility support', short: 'Mobility' },
];

export const serviceById = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
export const serviceTitle = (id) => serviceById[id]?.title || id;
export const serviceShort = (id) => serviceById[id]?.short || id;

// Belgrade, dinars, the same families the rest of the app talks about — the
// screenshots that prompted this view were euros and Finnish names from another
// product, and this one has its own.
export const money = (n) => `${n.toLocaleString('sr-RS').replace(/,/g, '.')} RSD`;

export const DEFAULT_RATE = 850;

export const clients = [
  {
    id: 'stevanovic',
    elder: 'Milica Stevanović',
    age: 84,
    initials: 'MS',
    family: 'Bogdan Stevanović',
    relation: 'Son',
    phone: '+381 63 555 210',
    area: 'Vračar',
    distance: '1.8 km',
    frailty: 5,
    needs: ['medication', 'meals', 'company'],
    hours: 12,
    schedule: 'Mon, Wed, Fri · 09:00–13:00',
    stage: 'request',
    waitingDays: 2,
    startsOn: 'Monday 18 August',
    visits: [],
    activity: [
      {
        kind: 'request',
        when: '2 days ago',
        text: 'Bogdan sent a request after finishing the care plan. Milica is at CFS 5.',
      },
    ],
  },
  {
    id: 'pavlovic',
    elder: 'Đorđe Pavlović',
    age: 79,
    initials: 'ĐP',
    family: 'Jelena Pavlović',
    relation: 'Daughter',
    phone: '+381 64 220 118',
    area: 'Zvezdara',
    distance: '3.2 km',
    frailty: 6,
    needs: ['personal-care', 'mobility', 'meals'],
    hours: 20,
    schedule: 'Every weekday · 08:00–12:00',
    stage: 'request',
    waitingHours: 4,
    startsOn: 'As soon as possible',
    visits: [],
    activity: [
      {
        kind: 'request',
        when: '4 hours ago',
        text: 'Jelena sent a request. She lives in Novi Sad and cannot be there on weekdays.',
      },
    ],
  },
  {
    id: 'jovanovic',
    elder: 'Radmila Jovanović',
    age: 88,
    initials: 'RJ',
    family: 'Nevena Jovanović',
    relation: 'Granddaughter',
    phone: '+381 60 771 940',
    area: 'Vračar',
    distance: '1.1 km',
    frailty: 6,
    needs: ['personal-care', 'meals', 'housekeeping'],
    hours: 15,
    schedule: 'Mon–Thu · 09:00–13:00',
    stage: 'agreement',
    agreementSent: false,
    acceptedOn: 'yesterday',
    visits: [],
    activity: [
      { kind: 'request', when: '3 days ago', text: 'Nevena sent a request for her grandmother.' },
      { kind: 'accepted', when: 'yesterday', text: 'You accepted. The agreement is still to be set.' },
    ],
  },
  {
    id: 'maric',
    elder: 'Vojislav Marić',
    age: 81,
    initials: 'VM',
    family: 'Aleksandar Marić',
    relation: 'Son',
    phone: '+381 63 044 617',
    area: 'Savski venac',
    distance: '4.6 km',
    frailty: 4,
    needs: ['company', 'errands', 'walks'],
    hours: 8,
    schedule: 'Tue, Thu · 10:00–14:00',
    stage: 'agreement',
    agreementSent: true,
    sentOn: '2 days ago',
    services: ['company', 'errands', 'walks'],
    rate: 850,
    visits: [],
    activity: [
      { kind: 'request', when: '5 days ago', text: 'Aleksandar sent a request.' },
      { kind: 'accepted', when: '4 days ago', text: 'You accepted.' },
      {
        kind: 'agreement-sent',
        when: '2 days ago',
        text: 'Agreement sent: 3 services at 850 RSD/h. Waiting for Aleksandar to sign.',
      },
    ],
  },
  {
    id: 'ilic',
    elder: 'Zorka Ilić',
    age: 86,
    initials: 'ZI',
    family: 'Milena Ilić',
    relation: 'Daughter',
    phone: '+381 64 909 335',
    area: 'Vračar',
    distance: '2.0 km',
    frailty: 5,
    needs: ['medication', 'meals', 'company'],
    hours: 12,
    schedule: 'Mon, Wed, Fri · 09:00–13:00',
    stage: 'active',
    services: ['medication', 'meals', 'company', 'housekeeping'],
    rate: 850,
    since: '12 June',
    nextVisit: 'Tomorrow · 09:00–13:00',
    visitHours: 4,
    visits: [
      { date: '8 August', time: '09:00–13:00', hours: 4, mood: 'good', eating: 'usual', moving: 'usual', services: ['medication', 'meals', 'company'], note: 'Morning routine, cooked for two days, short walk to the park.', status: 'paid' },
      { date: '6 August', time: '09:00–13:00', hours: 4, mood: 'usual', eating: 'usual', moving: 'usual', services: ['medication', 'meals', 'housekeeping'], note: 'Pharmacy run, laundry, lunch.', status: 'paid' },
      { date: '4 August', time: '09:00–13:00', hours: 4, mood: 'low', eating: 'less', moving: 'less', services: ['medication', 'meals'], concern: 'Eating much less than usual for the third time this week.', note: 'Tired all morning, did not want to go out. Ate very little.', status: 'paid' },
    ],
    activity: [
      { kind: 'request', when: '10 June', text: 'Milena sent a request.' },
      { kind: 'accepted', when: '10 June', text: 'You accepted.' },
      { kind: 'agreement-sent', when: '11 June', text: 'Agreement sent: 3 services at 850 RSD/h.' },
      { kind: 'agreement-signed', when: '12 June', text: 'Milena signed. The arrangement started.' },
      { kind: 'agreement-changed', when: '2 July', text: 'Light housekeeping added at Milena’s request. Rate unchanged.' },
      { kind: 'note', when: '4 August', text: 'You noted: eating much less than usual, worth telling the family.' },
      { kind: 'message', when: '5 August', text: 'Milena: “Thank you for calling. We booked the doctor for Friday.”' },
    ],
  },
  {
    id: 'nikolic',
    elder: 'Branko Nikolić',
    age: 90,
    initials: 'BN',
    family: 'Dušan Nikolić',
    relation: 'Son',
    phone: '+381 61 328 004',
    area: 'Zvezdara',
    distance: '3.8 km',
    frailty: 7,
    needs: ['personal-care', 'mobility', 'medication'],
    hours: 9,
    schedule: 'Tue, Thu, Sat · 10:00–13:00',
    stage: 'active',
    services: ['personal-care', 'mobility', 'medication'],
    rate: 900,
    since: '3 March',
    nextVisit: 'Thursday · 10:00–13:00',
    visitHours: 3,
    visits: [
      { date: '9 August', time: '10:00–13:00', hours: 3, mood: 'usual', eating: 'usual', moving: 'usual', services: ['personal-care', 'mobility', 'medication'], note: 'Wash, dressing, exercises with the walking frame.', status: 'paid' },
      { date: '7 August', time: '10:00–13:00', hours: 3, mood: 'good', eating: 'usual', moving: 'more', services: ['personal-care', 'mobility', 'medication'], note: 'Managed the stairs to the courtyard for the first time in weeks.', status: 'paid' },
    ],
    activity: [
      { kind: 'request', when: '1 March', text: 'Dušan sent a request.' },
      { kind: 'accepted', when: '1 March', text: 'You accepted.' },
      { kind: 'agreement-sent', when: '2 March', text: 'Agreement sent: 3 services at 900 RSD/h.' },
      { kind: 'agreement-signed', when: '3 March', text: 'Dušan signed. The arrangement started.' },
      { kind: 'note', when: '7 August', text: 'You noted: managed the stairs on his own. Worth keeping up.' },
    ],
  },
  {
    id: 'petrovic',
    elder: 'Ljubica Petrović',
    age: 83,
    initials: 'LJP',
    family: 'Marko Petrović',
    relation: 'Son',
    phone: '+381 63 610 227',
    area: 'Vračar',
    distance: '1.4 km',
    frailty: 5,
    needs: ['meals', 'housekeeping', 'company'],
    hours: 9,
    schedule: 'Mon, Wed, Fri · 09:00–12:00',
    stage: 'work-order',
    services: ['meals', 'housekeeping', 'company'],
    rate: 850,
    since: '4 May',
    dueInHours: 2,
    nextVisit: 'Friday · 09:00–12:00',
    visitHours: 3,
    visits: [
      { date: 'Yesterday', time: '09:00–12:00', hours: 3, status: 'due' },
      { date: '7 August', time: '09:00–12:00', hours: 3, mood: 'good', eating: 'usual', moving: 'usual', services: ['meals', 'housekeeping', 'company'], note: 'Cooked together, she did most of it herself.', status: 'paid' },
      { date: '5 August', time: '09:00–12:00', hours: 3, mood: 'usual', eating: 'usual', moving: 'usual', services: ['meals', 'housekeeping'], note: 'Shopping, cleaning the kitchen.', status: 'paid' },
    ],
    activity: [
      { kind: 'request', when: '2 May', text: 'Marko sent a request.' },
      { kind: 'accepted', when: '2 May', text: 'You accepted.' },
      { kind: 'agreement-sent', when: '3 May', text: 'Agreement sent: 3 services at 850 RSD/h.' },
      { kind: 'agreement-signed', when: '4 May', text: 'Marko signed. The arrangement started.' },
      { kind: 'message', when: '1 August', text: 'Marko: “Could you add Fridays from September?”' },
    ],
  },
  {
    id: 'djuric',
    elder: 'Slavko Đurić',
    age: 77,
    initials: 'SĐ',
    family: 'Tanja Đurić',
    relation: 'Daughter',
    phone: '+381 60 447 812',
    area: 'Palilula',
    distance: '5.1 km',
    frailty: 4,
    needs: ['company', 'walks', 'errands'],
    hours: 12,
    schedule: 'Mon, Thu · 08:00–14:00',
    stage: 'work-order',
    services: ['company', 'walks', 'errands'],
    rate: 800,
    since: '20 July',
    dueInHours: 19,
    nextVisit: 'Monday · 08:00–14:00',
    visitHours: 6,
    visits: [
      { date: '9 August', time: '08:00–14:00', hours: 6, status: 'due' },
      { date: '5 August', time: '08:00–14:00', hours: 6, mood: 'good', eating: 'more', moving: 'more', services: ['company', 'walks', 'errands'], note: 'Errands and a long walk. In good spirits all day.', status: 'paid' },
    ],
    activity: [
      { kind: 'request', when: '18 July', text: 'Tanja sent a request.' },
      { kind: 'accepted', when: '18 July', text: 'You accepted.' },
      { kind: 'agreement-sent', when: '19 July', text: 'Agreement sent: 3 services at 800 RSD/h.' },
      { kind: 'agreement-signed', when: '20 July', text: 'Tanja signed. The arrangement started.' },
    ],
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

export function totalsFor(hours, rate) {
  const charged = hours * rate;
  const fee = Math.round(charged * SERVICE_FEE);
  return { charged, fee, net: charged - fee };
}

// The visit still waiting on its work order. Held in one place rather than
// duplicated onto the client, which was two truths about the same visit.
export const dueVisit = (client) => (client.visits || []).find((v) => v.status === 'due');

export const workOrderTotals = (client) => {
  const v = dueVisit(client);
  return totalsFor(v ? v.hours : 0, client.rate);
};

// Where the agreement stands, said once so the board and the client page cannot
// disagree about it.
export function agreementState(client) {
  if (client.stage === 'request') return 'none';
  if (client.stage === 'agreement') return client.agreementSent ? 'sent' : 'draft';
  return 'active';
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
    soonestDue: workOrders.reduce((soonest, c) => Math.min(soonest, c.dueInHours ?? Infinity), Infinity),
    outstanding: workOrders.reduce((sum, c) => sum + workOrderTotals(c).net, 0),
  };
}
