import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CaregiverTopBar from '../../components/caregiver/CaregiverTopBar';
import Board from './Board';
import ClientPage from './ClientPage';
import {
  DEFAULT_RATE,
  clients as seedClients,
  money,
  paidThisMonth,
  serviceTitle,
  workOrderTotals,
} from '../../data/caregiverBoard';

// The caregiver's whole application: the board, one client, and the state both
// read from. It lives here rather than in the board because the client page
// changes the same records — an agreement sent from the client page has to move
// the card on the board, and the board's buttons have to show up in the
// client's activity.

export default function CaregiverApp({ user, onRestart }) {
  const [clients, setClients] = useState(seedClients);
  const [paid, setPaid] = useState(paidThisMonth);
  const [openId, setOpenId] = useState(null);

  const patch = (id, fn) =>
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...fn(c) } : c)));

  // Every action the caregiver takes leaves a line behind. The activity feed is
  // only worth having if it is written by the same code that does the thing.
  const logged = (client, kind, text) => [...(client.activity || []), { kind, when: 'just now', text }];

  const actions = {
    onOpen: (id) => setOpenId(id),

    onAccept: (id) =>
      patch(id, (c) => ({
        stage: 'agreement',
        agreementSent: false,
        acceptedOn: 'just now',
        activity: logged(c, 'accepted', 'You accepted. The agreement is still to be set.'),
      })),

    onDecline: (id) => setClients((cs) => cs.filter((c) => c.id !== id)),

    onRemind: (id) =>
      patch(id, (c) => ({
        remindedOn: 'just now',
        activity: logged(c, 'note', `You sent ${c.family} a reminder to sign the agreement.`),
      })),

    // A finished visit is what creates a work order, so logging one moves the
    // family into the column that says money is owed.
    onLogVisit: (id) =>
      patch(id, (c) => ({
        stage: 'work-order',
        visit: { date: 'Today', time: c.nextVisit?.split('· ')[1] || '', hours: c.visitHours },
        dueInHours: 24,
        visits: [
          {
            date: 'Today',
            time: c.nextVisit?.split('· ')[1] || '',
            hours: c.visitHours,
            mood: 'usual',
            note: 'Logged from the board — the visit report is still to be filled in.',
            status: 'due',
          },
          ...(c.visits || []),
        ],
        activity: logged(c, 'visit', `You logged a ${c.visitHours} h visit. The work order is due.`),
      })),

    onSendWorkOrder: (id) => {
      const c = clients.find((x) => x.id === id);
      if (!c) return;
      const net = workOrderTotals(c).net;
      setPaid((p) => p + net);
      patch(id, (cur) => ({
        stage: 'active',
        visit: null,
        dueInHours: null,
        visits: (cur.visits || []).map((v, i) => (i === 0 ? { ...v, status: 'paid' } : v)),
        activity: logged(
          cur,
          'work-order',
          `Work order sent for the ${c.visit.hours} h visit. ${money(net)} to you.`
        ),
      }));
    },
  };

  const sendAgreement = (id, { services, rate }) =>
    patch(id, (c) => ({
      agreementSent: true,
      sentOn: 'just now',
      services,
      rate: rate || DEFAULT_RATE,
      activity: logged(
        c,
        'agreement-sent',
        `Agreement sent: ${services.map(serviceTitle).join(', ').toLowerCase()} at ${money(rate)}/h. Waiting for ${c.family} to sign.`
      ),
    }));

  // A declined family is gone from the list, so an id can outlive its record.
  const open = clients.find((c) => c.id === openId);

  return (
    <div className="chat-container">
      <CaregiverTopBar user={user} onRestart={onRestart} />
      <AnimatePresence mode="wait">
        {open ? (
          <ClientPage
            key={open.id}
            client={open}
            onBack={() => setOpenId(null)}
            onSendAgreement={sendAgreement}
            onRemind={actions.onRemind}
          />
        ) : (
          <Board key="board" user={user} clients={clients} paid={paid} actions={actions} />
        )}
      </AnimatePresence>
    </div>
  );
}
