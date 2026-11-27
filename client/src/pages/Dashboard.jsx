import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Circle, Clock3, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { TaskRow } from '../components/TaskRow.jsx';
import Loading from '../components/Loading.jsx';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const notify = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  async function load() {
    try { setData((await api.get('/dashboard')).data); setError(''); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  useEffect(() => { load(); }, []);
  async function toggle(task) {
    try { await api.put(`/tasks/${task._id}`, { status: task.status === 'completed' ? 'todo' : 'completed' }); await load(); }
    catch (err) { notify(getErrorMessage(err), 'error'); }
  }
  async function remove(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try { await api.delete(`/tasks/${task._id}`); notify('Task deleted.'); await load(); }
    catch (err) { notify(getErrorMessage(err), 'error'); }
  }
  if (!data && !error) return <Loading />;
  const stats = data?.stats || {};
  const rate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  return (
    <div className="dashboard-page page-enter">
      <div className="welcome-row">
        <div><p className="date-line">{date}</p><h1>{greeting()}, {user?.name?.split(' ')[0]} <span className="wave">✦</span></h1><p className="page-subtitle">A little progress each day adds up to big results.</p></div>
        <Link className="button button-primary" to="/tasks"><Plus size={17} />Create a task</Link>
      </div>
      {error && <div className="error-banner">{error} <button className="text-button" onClick={load}>Try again</button></div>}
      <section className="stats-grid" aria-label="Task statistics">
        <article className="stat-card stat-total"><div className="stat-top"><span className="stat-label">Total tasks</span><span className="stat-icon icon-lilac"><Circle size={19} /></span></div><strong className="stat-number">{stats.total ?? '—'}</strong><span className="stat-caption">Across your workspace</span><div className="stat-decoration deco-total">◌</div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-label">In progress</span><span className="stat-icon icon-blue"><Clock3 size={18} /></span></div><strong className="stat-number">{stats.inProgress ?? '—'}</strong><span className="stat-caption">Keep the momentum going</span><div className="stat-decoration deco-progress">↗</div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-label">Completed</span><span className="stat-icon icon-green"><CheckCircle2 size={19} /></span></div><strong className="stat-number">{stats.completed ?? '—'}</strong><span className="stat-caption">{rate}% of all your tasks</span><div className="stat-decoration deco-done"><Check size={23} /></div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-label">Pending tasks</span><span className="stat-icon icon-amber"><Circle size={19} /></span></div><strong className="stat-number">{stats.todo ?? '—'}</strong><span className="stat-caption">Ready when you are</span><div className="stat-decoration deco-overdue">!</div></article>
      </section>
      <section className="dashboard-grid">
        <div className="panel recent-panel">
          <div className="panel-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h2>Recent tasks</h2></div><Link to="/tasks" className="inline-link">View all <ArrowRight size={15} /></Link></div>
          {data?.recentTasks?.length ? <div className="recent-list">{data.recentTasks.map((task) => <TaskRow key={task._id} task={task} compact onToggle={toggle} onEdit={() => { window.location.href = `/tasks?edit=${task._id}`; }} onDelete={remove} />)}</div> : <div className="empty-state dashboard-empty"><div className="empty-illustration"><Sparkles size={24} /></div><h3>Your next win starts here</h3><p>Create a task and make some progress. You’ve got this.</p><Link to="/tasks" className="button button-soft"><Plus size={16} />Create your first task</Link></div>}
        </div>
        <aside className="panel focus-panel">
          <div className="focus-panel-top"><span className="focus-orb"><Sparkles size={18} /></span><span className="eyebrow">A MOMENT TO FOCUS</span></div>
          <h2>Progress, not<br />perfection.</h2><p>Choose one thing that matters today. Give it your attention, and let everything else wait its turn.</p>
          <div className="focus-progress"><div className="focus-progress-head"><span>Daily progress</span><strong>{rate}%</strong></div><div className="progress-track"><span style={{ width: `${rate}%` }} /></div><div className="focus-progress-foot"><span>{stats.completed || 0} completed</span><span>{stats.total || 0} total</span></div></div>
          <Link to="/tasks" className="focus-link">Go to my tasks <ArrowUpRight size={15} /></Link>
        </aside>
      </section>
      <div className="dashboard-footer"><span>✦</span> You’re building something good. Keep going.</div>
    </div>
  );
}
