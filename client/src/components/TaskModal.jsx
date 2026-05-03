import { X } from "lucide-react";
import { useEffect, useState } from "react";

const initialState = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  assignedTo: ""
};

export function TaskModal({
  open,
  project,
  task,
  currentUser,
  isAdmin,
  canManageAssignment,
  canSetStatus,
  onClose,
  onSave
}) {
  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (task) {
      setFormState({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        assignedTo: String(task.assignedTo.id)
      });
      return;
    }

    setFormState({
      ...initialState,
      dueDate: new Date().toISOString().slice(0, 10),
      assignedTo: currentUser ? String(currentUser.id) : ""
    });
  }, [open, task, currentUser]);

  if (!open || !project) {
    return null;
  }

  const assignableMembers = isAdmin
    ? project.members
    : project.members.filter((member) => member.id === currentUser.id);

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      title: formState.title,
      description: formState.description,
      priority: formState.priority,
      dueDate: formState.dueDate,
      projectId: project.id
    };

    if (!task || canSetStatus(task)) {
      payload.status = formState.status;
    }

    if (!task || canManageAssignment) {
      payload.assignedTo = Number(formState.assignedTo);
    }

    onSave(payload);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="modal-card__header">
          <div>
            <p className="eyebrow">{task ? "Update Task" : "Create Task"}</p>
            <h3>{project.name}</h3>
          </div>
          <button className="modal-close-button" type="button" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input name="title" onChange={updateField} required value={formState.title} />
          </label>

          <label>
            Description
            <textarea name="description" onChange={updateField} rows="4" value={formState.description} />
          </label>

          <div className="task-form__grid">
            <label>
              Status
              <select
                disabled={task ? !canSetStatus(task) : false}
                name="status"
                onChange={updateField}
                value={formState.status}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </label>

            <label>
              Priority
              <select name="priority" onChange={updateField} value={formState.priority}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>

            <label>
              Due Date
              <input name="dueDate" onChange={updateField} required type="date" value={formState.dueDate} />
            </label>

            <label>
              Assignee
              <select
                disabled={!canManageAssignment}
                name="assignedTo"
                onChange={updateField}
                required
                value={formState.assignedTo}
              >
                {assignableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="primary-button" type="submit">
            {task ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
