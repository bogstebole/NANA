import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Register from './screens/Register';
import Chat from './screens/Chat';
import ArchivedChat from './screens/ArchivedChat';
import Dashboard from './screens/Dashboard';
import Plans from './screens/Plans';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import AppNav from './components/AppNav';
import CaregiverSidebar from './components/CaregiverSidebar';
import PaywallModal from './components/PaywallModal';
import { statusCounts } from './data/bookings';
import { caregivers } from './data/carePlan';
import { seedThreads } from './data/threads';

const formatToday = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function App() {
  const [phase, setPhase] = useState('register'); // register | app
  const [view, setView] = useState('chat');
  const [user, setUser] = useState({ name: '', email: '' });
  // answers live here so the profile can read them without a second source of truth
  const [answers, setAnswers] = useState({});
  const [plan, setPlan] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // null when closed, otherwise { caregiver } — a caregiver means the user tapped one
  // to request their number, no caregiver means they unlocked the recommendations.
  const [paywall, setPaywall] = useState(null);
  const [threads, setThreads] = useState(seedThreads);
  const [activeThread, setActiveThread] = useState('live');
  const [run, setRun] = useState(0); // remounts the flow on restart

  const onPlan = useCallback((p) => setPlan(p), []);
  const onAnswer = useCallback(
    (questionId, answer) => setAnswers((a) => ({ ...a, [questionId]: answer })),
    []
  );
  const selectCaregiver = useCallback((c) => setPaywall({ caregiver: c }), []);
  const goToChat = () => setView('chat');

  const restart = () => {
    setAnswers({});
    setPlan(null);
    setUnlocked(false);
    setSidebarOpen(false);
    setPaywall(null);
    setThreads(seedThreads);
    setActiveThread('live');
    setView('chat');
    setRun((r) => r + 1);
    setPhase('register');
  };

  // Starting a new chat files the current one away first — but only if it actually
  // got somewhere, so an untouched thread does not clutter the history.
  const newChat = () => {
    if (plan) {
      setThreads((t) => [
        {
          id: `thread-${Date.now()}`,
          title: `Care plan for ${plan.firstName}`,
          date: formatToday(),
          summary: plan.summary,
          answers,
          caregivers: caregivers.length,
          messages: [],
        },
        ...t,
      ]);
    }
    setAnswers({});
    setPlan(null);
    setSidebarOpen(false);
    setActiveThread('live');
    setView('chat');
    setRun((r) => r + 1);
  };

  const selectThread = (id) => {
    setActiveThread(id);
    setView('chat');
    setSidebarOpen(false);
  };

  const openThread = threads.find((t) => t.id === activeThread);

  const openPlan = () => {
    setSidebarOpen(true);
    setView('chat');
  };

  // Requests only exist once the user has actually contacted someone.
  const hasBookings = unlocked;

  return (
    <div className="app">
      {phase === 'app' && (
        <AppNav
          view={view}
          onView={setView}
          user={user}
          badge={hasBookings ? statusCounts().pending : 0}
          threads={threads}
          activeThread={activeThread}
          onSelectThread={selectThread}
          onNewChat={newChat}
          onRestart={restart}
        />
      )}

      {phase === 'register' ? (
        <div className="chat-container">
          <AnimatePresence mode="wait">
            <Register
              key={`register-${run}`}
              onContinue={(u) => {
                setUser(u);
                setPhase('app');
              }}
            />
          </AnimatePresence>
        </div>
      ) : (
        <>
          {/* the live chat stays mounted behind everything so its progress survives */}
          <div
            className="chat-container"
            style={{ display: view === 'chat' && !openThread ? 'flex' : 'none' }}
          >
            <Chat
              key={`chat-${run}`}
              user={user}
              answers={answers}
              onAnswer={onAnswer}
              plan={plan}
              onPlan={onPlan}
              unlocked={unlocked}
              onOpenPlan={() => setSidebarOpen(true)}
              onSelectCaregiver={selectCaregiver}
            />
          </div>

          {view === 'chat' && openThread && (
            <div className="chat-container">
              <ArchivedChat
                key={openThread.id}
                thread={openThread}
                user={user}
                onNewChat={newChat}
              />
            </div>
          )}

          {view !== 'chat' && (
            <div className="chat-container">
              {view === 'dashboard' && (
                <Dashboard hasBookings={hasBookings} onGoToChat={goToChat} />
              )}
              {view === 'plans' && (
                <Plans plan={plan} onOpenPlan={openPlan} onGoToChat={goToChat} />
              )}
              {view === 'profile' && (
                <Profile user={user} answers={answers} onGoToChat={goToChat} />
              )}
              {view === 'settings' && <Settings unlocked={unlocked} />}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {sidebarOpen && plan && (
          <CaregiverSidebar
            key="sidebar"
            plan={plan}
            unlocked={unlocked}
            onSelectCaregiver={selectCaregiver}
            onUnlock={() => setPaywall({ caregiver: null })}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paywall && plan && (
          <PaywallModal
            key="paywall"
            caregiver={paywall.caregiver}
            plan={plan}
            onPay={() => {
              setUnlocked(true);
              setPaywall(null);
              setSidebarOpen(true);
            }}
            onClose={() => setPaywall(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
