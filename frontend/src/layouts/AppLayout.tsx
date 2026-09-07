/**
 * AppLayout — the main shell with sidebar navigation.
 * Wraps all authenticated pages. Redirects to /login if no user is found.
 */
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Code2, Bug, BookOpen,
  History, Settings, LogOut, Cpu, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generate',  icon: Code2,           label: 'Generate Code' },
  { to: '/debug',     icon: Bug,             label: 'Debug Code' },
  { to: '/explain',   icon: BookOpen,        label: 'Explain Code' },
  { to: '/history',   icon: History,         label: 'History' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 bg-surface-800 border-r border-slate-700/60 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700/60">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-tight">CodeAI</p>
            <p className="text-[10px] text-slate-500 font-medium">Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'nav-item-active' : 'nav-item'
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>

        {/* User profile + logout */}
        <div className="px-3 py-4 border-t border-slate-700/60">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-700 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary-600/40 border border-primary-500/40 flex items-center justify-center text-xs font-bold text-primary-300">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
