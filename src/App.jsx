import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import Logo from './components/Logo';
import Register from './screens/Register';
import Chat from './screens/Chat';
import CaregiverSidebar from './components/CaregiverSidebar';
import PaywallModal from './components/PaywallModal';

export default function App() {
  const [phase, setPhase] = useState('register'); // register | chat
  const [user, setUser] = useState({ name: '', email: '' });
  const [plan, setPlan] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // null when closed, otherwise { caregiver } — a caregiver means the user tapped one
  // to request their number, no caregiver means they unlocked the recommendations.
  const [paywall, setPaywall] = useState(null);
  const [run, setRun] = useState(0); // remounts the flow on restart

  const onPlan = useCallback((p) => setPlan(p), []);
  const selectCaregiver = useCallback((c) => setPaywall({ caregiver: c }), []);

  const restart = () => {
    setPlan(null);
    setUnlocked(false);
    setSidebarOpen(false);
    setPaywall(null);
    setRun((r) => r + 1);
    setPhase('register');
  };

  return (
    <div className="app">
      <div className="chat-container">
        {phase === 'chat' && (
          <div className="chat-header">
            <Logo width={120} />
            <button type="button" className="ci-btn header-restart" onClick={restart} aria-label="Start over">
              <RotateCcw size={16} strokeWidth={1.75} />
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {phase === 'register' ? (
            <Register
              key={`register-${run}`}
              onContinue={(u) => {
                setUser(u);
                setPhase('chat');
              }}
            />
          ) : (
            <Chat
              key={`chat-${run}`}
              user={user}
              plan={plan}
              onPlan={onPlan}
              unlocked={unlocked}
              onOpenPlan={() => setSidebarOpen(true)}
              onSelectCaregiver={selectCaregiver}
            />
          )}
        </AnimatePresence>
      </div>

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
