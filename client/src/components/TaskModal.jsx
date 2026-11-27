import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const emptyTask = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };
export default function TaskModal({ task, onClose, onSave, saving }) {
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState('');
  useEffect(() => {
    setForm(task ? {
      title: task.title || '', description: task.description || '', priority: task.priority || 'medium',
      status: task.status || 'todo', dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    } : emptyTask);
  }, [task]);
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) { setError('Give your task a title to get started.'); return; }
    setError('');
    await onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
  }
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <header className="modal-header">
          <div><p className="eyebrow">{task ? 'KEEP IT MOVING' : 'A FRESH START'}</p><h2 id="task-modal-title">{task ? 'Edit task' : 'Create a task'}</h2></div>
          <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={20} /></button>
        </header>
        <form className="form-stack" onSubmit={submit}>
          <label className="field-label">Task name<input autoFocus name="title" value={form.title} onChange={update} placeholder="What needs to get done?" maxLength="140" /></label>
          <label className="field-label">Description <span className="optional">Optional</span><textarea name="description" value={form.description} onChange={update} placeholder="Add a few details…" rows="3" maxLength="2000" /></label>
          <div className="field-grid">
            <label className="field-label">Priority<select name="priority" value={form.priority} onChange={update}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            <label className="field-label">Status<select name="status" value={form.status} onChange={update}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>
          </div>
          <label className="field-label">Due date <span className="optional">Optional</span><input type="date" name="dueDate" value={form.dueDate} onChange={update} /></label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
        </form>
      </section>
    </div>
  );
}
