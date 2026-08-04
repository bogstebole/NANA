import { FileText, LayoutDashboard, MessageSquare, RotateCcw, Settings, User } from 'lucide-react';
import Logo from './Logo';

const ITEMS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'plans', label: 'Care plans', icon: FileText },
];

const FOOTER_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AppNav({ view, onView, user, badge, onRestart }) {
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

      <div className="nav-group">{ITEMS.map(item)}</div>

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
