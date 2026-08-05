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
import ChatTopBar from './components/ChatTopBar';
import CaregiverSidebar from './components/CaregiverSidebar';
import CopilotPanel from './components/CopilotPanel';
import PaywallModal from './components/PaywallModal';
import PlanDetail from './screens/PlanDetail';
import Immersive from './screens/Immersive';
import { questions } from './data/flow';
import { statusCounts } from './data/bookings';
import { caregivers } from './data/carePlan';
import { planEntries, seedThreads } from './data/threads';

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
  // one slot on the right: the care plan or the assistant, never both
  const [rightPanel, setRightPanel] = useState(null); // null | 'plan' | 'copilot'
  // null when closed, otherwise { caregiver } — a caregiver means the user tapped one
  // to request their number, no caregiver means they unlocked the recommendations.
  const [paywall, setPaywall] = useState(null);
  const [threads, setThreads] = useState(seedThreads);
  const [activeThread, setActiveThread] = useState('live');
  const [chatListOpen, setChatListOpen] = useState(true);
  const [planListOpen, setPlanListOpen] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('live');
  const [variant, setVariant] = useState('classic'); // classic | immersive
  const [run, setRun] = useState(0); // remounts the flow on restart

  const onPlan = useCallback((p) => setPlan(p), []);
  const onAnswer = useCallback(
    (questionId, answer) => setAnswers((a) => ({ ...a, [questionId]: answer })),
    []
  );
  const selectCaregiver = useCallback((c) => setPaywall({ caregiver: c }), []);
  const goToChat = () => setView('chat');
  const askAssistant = () => setRightPanel('copilot');

  const restart = () => {
    setAnswers({});
    setPlan(null);
    setUnlocked(false);
    setRightPanel(null);
    setPaywall(null);
    setThreads(seedThreads);
    setActiveThread('live');
    setView('chat');
    setVariant('classic');
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
    setRightPanel(null);
    setActiveThread('live');
    setChatListOpen(true);
    setView('chat');
    setRun((r) => r + 1);
  };

  const selectThread = (id) => {
    setActiveThread(id);
    setView('chat');
    setRightPanel(null);
  };

  // From the Care plans side a plan opens as its own page; from the chat it stays
  // a side panel, because there it is an artifact of the conversation.
  const openPlanPage = (id) => {
    setSelectedPlan(id);
    setView('plan-detail');
    setPlanListOpen(true);
  };

  // The immersive variant is a fullscreen take on the same questionnaire, so it
  // only makes sense while questions are still open; once they're all answered
  // there is nothing for it to ask and we stay in the chat.
  const questionnaireDone = questions.every((q) => answers[q.id]);
  const showImmersive = phase === 'app' && variant === 'immersive' && !questionnaireDone;

  const startVariant = (next) => {
    setVariant(next);
    if (next === 'immersive') {
      setRightPanel(null);
      setActiveThread('live');
      setView('chat');
    }
  };

  const openThread = threads.find((t) => t.id === activeThread);

  const entries = planEntries({
    plan,
    threads,
    caregiverCount: caregivers.length,
    today: formatToday(),
  });
  const openEntry = entries.find((e) => e.id === selectedPlan) || entries[0];

  // The live chat is named after whatever it has produced so far.
  const liveTitle = plan
    ? `Care plan for ${plan.firstName}`
    : Object.keys(answers).length
      ? 'New care plan'
      : 'New chat';

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
          liveTitle={liveTitle}
          onSelectThread={selectThread}
          onNewChat={newChat}
          chatListOpen={chatListOpen}
          onToggleChatList={() => setChatListOpen((v) => !v)}
          planEntries={entries}
          selectedPlan={selectedPlan}
          onSelectPlan={openPlanPage}
          planListOpen={planListOpen}
          onTogglePlanList={() => setPlanListOpen((v) => !v)}
          variant={variant}
          onVariant={startVariant}
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
            <ChatTopBar
              title={liveTitle}
              subtitle={plan ? 'Updated just now' : 'In progress'}
              artifactLabel={plan ? 'Care plan' : null}
              onArtifacts={() => setRightPanel('plan')}
              onNewChat={newChat}
            />
            <Chat
              key={`chat-${run}`}
              user={user}
              answers={answers}
              onAnswer={onAnswer}
              plan={plan}
              onPlan={onPlan}
              unlocked={unlocked}
              onOpenPlan={() => setRightPanel('plan')}
              onSelectCaregiver={selectCaregiver}
            />
          </div>

          {view === 'chat' && openThread && (
            <div className="chat-container">
              <ChatTopBar
                title={openThread.title}
                subtitle={`Archived · ${openThread.date}`}
                artifactLabel="Care plan"
                onArtifacts={() => {
                  document
                    .getElementById('archived-artifact')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                onNewChat={newChat}
              />
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
                <Dashboard
                  hasBookings={hasBookings}
                  onGoToChat={goToChat}
                  onAskAssistant={askAssistant}
                />
              )}
              {view === 'plans' && (
                <Plans
                  entries={entries}
                  onOpenPlan={openPlanPage}
                  onGoToChat={goToChat}
                  onAskAssistant={askAssistant}
                />
              )}
              {view === 'plan-detail' && openEntry && (
                <PlanDetail
                  entry={openEntry}
                  unlocked={unlocked}
                  onBack={() => setView('plans')}
                  onSelectCaregiver={selectCaregiver}
                  onUnlock={() => setPaywall({ caregiver: null })}
                  onAskAssistant={askAssistant}
                />
              )}
              {view === 'profile' && (
                <Profile
                  user={user}
                  answers={answers}
                  onGoToChat={goToChat}
                  onAskAssistant={askAssistant}
                />
              )}
              {view === 'settings' && (
                <Settings unlocked={unlocked} onAskAssistant={askAssistant} />
              )}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {rightPanel === 'plan' && plan && (
          <CaregiverSidebar
            key="plan-panel"
            plan={plan}
            unlocked={unlocked}
            onSelectCaregiver={selectCaregiver}
            onUnlock={() => setPaywall({ caregiver: null })}
            onClose={() => setRightPanel(null)}
          />
        )}
        {rightPanel === 'copilot' && (
          <CopilotPanel
            key="copilot-panel"
            view={view}
            plan={plan}
            unlocked={unlocked}
            onClose={() => setRightPanel(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImmersive && (
          <Immersive
            key="immersive"
            user={user}
            answers={answers}
            onAnswer={onAnswer}
            onExit={() => setVariant('classic')}
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
              setRightPanel('plan');
            }}
            onClose={() => setPaywall(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
