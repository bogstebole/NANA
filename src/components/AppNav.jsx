import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Plus,
  RotateCcw,
  Settings,
  User,
} from 'lucide-react';
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
  onSelectThread,
  onNewChat,
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
        {item({ id: 'chat', label: 'Chat', icon: MessageSquare })}

        {/* the thread list only unfolds while the chat is the current view */}
        {view === 'chat' && (
          <div className="nav-sub">
            <button type="button" className="nav-sub-item is-new" onClick={onNewChat}>
              <Plus size={14} strokeWidth={2} />
              <span>New chat</span>
            </button>
            <button
              type="button"
              className={`nav-sub-item${activeThread === 'live' ? ' is-active' : ''}`}
              onClick={() => onSelectThread('live')}
            >
              <span className="nav-sub-label">Current chat</span>
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
        )}

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
