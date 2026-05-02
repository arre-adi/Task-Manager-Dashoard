import { X } from "lucide-react";
import { useEffect, useState } from "react";

const initialState = {
  name: "",
  description: ""
};

export function ProjectModal({ open, onClose, onSave, error }) {
  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    if (open) {
      setFormState(initialState);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formState);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card modal-card--project" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="modal-card__header">
          <div>
            <p className="eyebrow">Create Project</p>
            <h3>Start a new workspace</h3>
          </div>
          <button className="modal-close-button" type="button" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <label>
            Project Name
            <input name="name" onChange={updateField} required value={formState.name} />
          </label>

          <label>
            Description
            <textarea
              name="description"
              onChange={updateField}
              rows="4"
              value={formState.description}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
}
