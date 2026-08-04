import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Plus,
  RotateCcw,
  Settings,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';

const FOOTER_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AppNav({
  view,
  onView,
  user,
  badge,
  threads,
  activeThread,
  liveTitle,
  onSelectThread,
  onNewChat,
  chatListOpen,
  onToggleChatList,
  onRestart,
}) {
  const initials =
    user.name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NP';

  const item = ({ id, label, icon: Icon }) => (
    <button
      key={id}
      type="button"
      className={`nav-item${view === id ? ' is-active' : ''}`}
      onClick={() => onView(id)}
      aria-current={view === id ? 'page' : undefined}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span>{label}</span>
      {id === 'dashboard' && badge > 0 && <span className="nav-badge">{badge}</span>}
    </button>
  );

  return (
    <nav className="app-nav">
      <div className="nav-head">
        <Logo width={110} />
      </div>

      <div className="nav-group">
        {/* the chevron folds the thread list away, and new-chat sits on the row
            itself so neither needs the list open first */}
        <div className={`nav-item has-action${view === 'chat' ? ' is-active' : ''}`}>
          <button
            type="button"
            className="nav-item-main"
            onClick={() => onView('chat')}
            aria-current={view === 'chat' ? 'page' : undefined}
          >
            <MessageSquare size={16} strokeWidth={1.75} />
            <span>Chat</span>
          </button>
          <button
            type="button"
            className="nav-inline-btn"
            onClick={onToggleChatList}
            aria-label={chatListOpen ? 'Collapse chats' : 'Expand chats'}
            aria-expanded={chatListOpen}
          >
            <ChevronDown
              size={15}
              strokeWidth={2}
              className={`toggle-chevron${chatListOpen ? '' : ' is-up'}`}
            />
          </button>
          <button
            type="button"
            className="nav-inline-btn"
            onClick={onNewChat}
            aria-label="New chat"
            title="New chat"
          >
            <Plus size={15} strokeWidth={2} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {chatListOpen && (
            <motion.div
              key="threads"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="nav-sub">
                <button
                  type="button"
                  className={`nav-sub-item${activeThread === 'live' ? ' is-active' : ''}`}
                  onClick={() => onSelectThread('live')}
                >
                  <span className="nav-sub-label">{liveTitle}</span>
                  <span className="nav-sub-date">Current</span>
                </button>
                {threads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`nav-sub-item${activeThread === t.id ? ' is-active' : ''}`}
                    onClick={() => onSelectThread(t.id)}
                  >
                    <span className="nav-sub-label">{t.title}</span>
                    <span className="nav-sub-date">{t.date}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {item({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard })}
        {item({ id: 'plans', label: 'Care plans', icon: FileText })}
      </div>

      <div className="nav-group nav-group-end">
        {FOOTER_ITEMS.map(item)}
        <div className="nav-user">
          <span className="cg-avatar">{initials}</span>
          <span className="nav-user-text">
            <span className="nav-user-name">{user.name || 'Guest'}</span>
            <span className="nav-user-mail">{user.email}</span>
          </span>
          <button type="button" className="ci-btn" onClick={onRestart} aria-label="Start over">
            <RotateCcw size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </nav>
  );
}
