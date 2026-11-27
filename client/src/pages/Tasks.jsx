import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CheckCheck, ListFilter, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { TaskRow } from '../components/TaskRow.jsx';
import TaskModal from '../components/TaskModal.jsx';
import Loading from '../components/Loading.jsx';

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const notify = useToast();
  const [tasks, setTasks] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ all: 0, todo: 0, 'in-progress': 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sort, setSort] = useState('createdAt');
  const [modal, setModal] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params: { search: search || undefined, status: status === 'all' ? undefined : status, priority: priority === 'all' ? undefined : priority, sort } });
      setTasks(data.tasks);
      setStatusCounts(data.statusCounts || { all: 0, todo: 0, 'in-progress': 0, completed: 0 });
    } catch (error) { notify(getErrorMessage(error), 'error'); }
    finally { setLoading(false); }
  }, [search, status, priority, sort, notify]);
  useEffect(() => { const timer = window.setTimeout(load, 220); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => {
    const handler = () => setModal(null);
    const editHandler = (event) => setModal(event.detail);
    window.addEventListener('taskflow:new-task', handler);
    window.addEventListener('taskflow:edit-task', editHandler);
    return () => {
      window.removeEventListener('taskflow:new-task', handler);
      window.removeEventListener('taskflow:edit-task', editHandler);
    };
  }, []);
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId || loading) return;
    const match = tasks.find((task) => task._id === editId);
    if (match) {
      setModal(match);
      setSearchParams({}, { replace: true });
    }
  }, [loading, searchParams, setSearchParams, tasks]);
  const counts = useMemo(() => statusCounts, [statusCounts]);
  async function save(form) {
    setSaving(true);
    try {
      if (modal?._id) await api.put(`/tasks/${modal._id}`, form);
      else await api.post('/tasks', form);
      notify(modal?._id ? 'Your changes are saved.' : 'Task created. One step closer!');
      setModal(undefined);
      await load();
    } catch (error) { notify(getErrorMessage(error), 'error'); }
    finally { setSaving(false); }
  }
  async function toggle(task) {
    try { await api.put(`/tasks/${task._id}`, { status: task.status === 'completed' ? 'todo' : 'completed' }); notify(task.status === 'completed' ? 'Task moved back to to do.' : 'Nicely done — task completed!'); await load(); }
    catch (error) { notify(getErrorMessage(error), 'error'); }
  }
  async function remove(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try { await api.delete(`/tasks/${task._id}`); notify('Task deleted.'); await load(); }
    catch (error) { notify(getErrorMessage(error), 'error'); }
  }
  const clearFilters = () => { setSearch(''); setStatus('all'); setPriority('all'); setSort('createdAt'); };
  const hasFilters = search || status !== 'all' || priority !== 'all';
  return (
    <div className="tasks-page page-enter">
      <div className="page-heading-row"><div><p className="eyebrow">YOUR SPACE, YOUR PACE</p><h1>My tasks</h1><p className="page-subtitle">Keep track of what matters, one step at a time.</p></div><button className="button button-primary" onClick={() => setModal(null)}><Plus size={17} />New task</button></div>
      <div className="task-tabs">
        {[['all', 'All tasks', ListFilter], ['todo', 'To do', null], ['in-progress', 'In progress', null], ['completed', 'Completed', CheckCheck]].map(([key, label, Icon]) => <button key={key} className={`task-tab ${status === key ? 'task-tab-active' : ''}`} onClick={() => setStatus(key)}>{Icon && <Icon size={15} />}{label}<span>{counts[key]}</span></button>)}
      </div>
      <div className="filter-bar">
        <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks…" /><kbd>⌘ K</kbd></label>
        <div className="filter-controls"><SlidersHorizontal size={16} className="filter-icon" />
          <select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">Any priority</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select>
          <select aria-label="Sort tasks" value={sort} onChange={(event) => setSort(event.target.value)}><option value="createdAt">Recently updated</option><option value="dueDate">Due date</option></select>
          {hasFilters && <button className="clear-filter" onClick={clearFilters}><X size={14} />Clear</button>}
        </div>
      </div>
      <div className="task-list-panel">
        <div className="task-list-heading"><span>{status === 'all' ? 'All your tasks' : status === 'todo' ? 'To do' : status === 'completed' ? 'Completed' : 'In progress'} <span className="task-count">{tasks.length}</span></span><span className="list-due-label"><CalendarDays size={14} /> Due date</span></div>
        {loading ? <div className="list-loading"><span className="spinner" />Loading tasks…</div> : tasks.length ? <div>{tasks.map((task) => <TaskRow key={task._id} task={task} onToggle={toggle} onEdit={setModal} onDelete={remove} />)}</div> : <div className="empty-state tasks-empty"><div className="empty-illustration"><Search size={23} /></div><h3>{hasFilters || status !== 'all' ? 'No tasks found' : 'A clean slate'}</h3><p>{hasFilters || status !== 'all' ? 'Try adjusting your filters or search.' : 'Add your first task and start making progress.'}</p>{hasFilters ? <button className="button button-soft" onClick={clearFilters}>Clear filters</button> : <button className="button button-soft" onClick={() => setModal(null)}><Plus size={16} />Create a task</button>}</div>}
      </div>
      <p className="tasks-bottom-note">Every task you finish is progress worth celebrating. <span>✦</span></p>
      {modal !== undefined && <TaskModal task={modal} onClose={() => setModal(undefined)} onSave={save} saving={saving} />}
    </div>
  );
}
