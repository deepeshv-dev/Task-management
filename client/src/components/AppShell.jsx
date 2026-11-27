import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CheckSquare2, ChevronDown, CircleHelp, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'My tasks', icon: CheckSquare2 },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isTasks = location.pathname === '/tasks';
  async function logout() {
    await signOut();
    notify('You have been signed out.', 'info');
    navigate('/login');
  }
  const initials = (user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><CheckSquare2 size={20} strokeWidth={2.5} /></div><span>task<span className="brand-accent">flow</span></span><button className="icon-button mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'My tasks' && <span className="nav-chevron">›</span>}</NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-card"><span className="focus-spark">✳</span><strong>Make today count</strong><p>Small steps add up to big things.</p></div>
          <button className="help-link" onClick={() => notify('Tip: break big projects into smaller tasks.', 'info')}><CircleHelp size={17} />Help & tips</button>
          <div className="sidebar-user">
            <div className="avatar">{initials}</div><div className="user-copy"><strong>{user?.name}</strong><span>{user?.email}</span></div>
            <button className="icon-button user-menu-trigger" aria-label="Account options" onClick={() => setProfileOpen((open) => !open)}><ChevronDown size={16} /></button>
            {profileOpen && <div className="user-popover"><button onClick={() => { setProfileOpen(false); navigate('/profile'); }}><Settings2 size={15} />Account settings</button><button onClick={logout}><LogOut size={15} />Sign out</button></div>}
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{location.pathname === '/' ? 'Overview' : location.pathname.slice(1).replace(/^./, (c) => c.toUpperCase())}</strong></div>
          <div className="topbar-actions"><button className="top-search" onClick={() => navigate('/tasks')}><Search size={16} /><span>Search tasks</span><kbd>⌘ K</kbd></button>{isTasks && <button className="button button-primary top-create" onClick={() => window.dispatchEvent(new Event('taskflow:new-task'))}><Plus size={17} />New task</button>}</div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
