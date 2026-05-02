import { Trash2 } from "lucide-react";

export function TaskTable({ tasks, canDelete, canEdit, onEdit, onDelete }) {
  function progressForTask(task) {
    if (task.status === "DONE") {
      return 100;
    }

    if (task.status === "IN_PROGRESS") {
      return 64;
    }

    return 18;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-row" key={task.id}>
          <div className="task-row__main">
            <strong>{task.title}</strong>
            <p>{task.description || task.projectName || "No description"}</p>
          </div>
          <div className="task-row__meta">
            <span className={`status-pill status-pill--${task.status.toLowerCase()}`}>
              {task.status.replace("_", " ")}
            </span>
            <span className={`priority-pill priority-pill--${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
            <span className="task-row__deadline">
              Due {new Date(task.dueDate).toLocaleDateString()} · {task.assignedTo.name}
            </span>
          </div>
          <div className="task-row__progress">
            <div className="progress-track">
              <span style={{ width: `${progressForTask(task)}%` }} />
            </div>
            <strong>{progressForTask(task)}%</strong>
          </div>
          <div className="table-actions">
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
      ))}
    </div>
  );
}
