import { CalendarDays, Check, Circle, Clock3, MoreHorizontal } from 'lucide-react';

const statusNames = { todo: 'To do', 'in-progress': 'In progress', completed: 'Completed' };
const priorityNames = { low: 'Low', medium: 'Medium', high: 'High' };

export function formatDate(value) {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function TaskRow({ task, onToggle, onEdit, onDelete, compact = false }) {
  const done = task.status === 'completed';
  return (
    <article className={`task-row ${compact ? 'task-row-compact' : ''} ${done ? 'task-done' : ''}`}>
      <button className={`task-check ${done ? 'checked' : ''}`} onClick={() => onToggle(task)} aria-label={done ? 'Mark as to do' : 'Mark as completed'}>
        {done ? <Check size={14} /> : <Circle size={18} />}
      </button>
      <button className="task-main" onClick={() => onEdit(task)}>
        <span className="task-title">{task.title}</span>
        {!compact && task.description && <span className="task-description">{task.description}</span>}
        <span className="task-mobile-meta"><CalendarDays size={13} /> {formatDate(task.dueDate)}</span>
      </button>
      <span className={`priority-pill priority-${task.priority}`}>{priorityNames[task.priority]}</span>
      {!compact && <span className={`status-pill status-${task.status}`}>{statusNames[task.status]}</span>}
      <span className={`task-due ${task.dueDate && new Date(task.dueDate) < new Date() && !done ? 'is-overdue' : ''}`}>
        {task.dueDate && <CalendarDays size={14} />}{formatDate(task.dueDate)}
      </span>
      <div className="task-actions">
        <button className="icon-button" aria-label="Edit task" onClick={() => onEdit(task)}><MoreHorizontal size={19} /></button>
        <button className="icon-button delete-action" aria-label="Delete task" onClick={() => onDelete(task)}><span>×</span></button>
      </div>
    </article>
  );
}

export function StatusIcon({ status }) {
  if (status === 'completed') return <Check size={13} />;
  if (status === 'in-progress') return <Clock3 size={13} />;
  return <Circle size={13} />;
}
