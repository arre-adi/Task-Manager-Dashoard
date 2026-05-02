import { Trash2 } from "lucide-react";

export function TaskCard({ task, canChangeStatus, canDelete, canEdit, onEdit, onDelete }) {
  return (
    <article
      className="task-card"
      draggable={canChangeStatus(task)}
      data-task-id={task.id}
      data-status={task.status}
      aria-grabbed={canChangeStatus(task)}
    >
      <div className="task-card__header">
        <h4>{task.title}</h4>
        <span className={`badge badge--${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      <p>{task.description || "No description added yet."}</p>
      <div className="task-meta">
        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
        <span>{task.assignedTo.name}</span>
      </div>
      <div className="task-actions">
        {canEdit(task) ? (
          <button type="button" onClick={() => onEdit(task)}>
            Edit
          </button>
        ) : null}
        {canDelete(task) ? (
          <button className="danger-icon-button" title="Delete task" type="button" onClick={() => onDelete(task)}>
            <Trash2 className="delete-icon" size={14} strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
