import { useState } from "react";
import { TaskCard } from "../components/TaskCard.jsx";
import { TaskModal } from "../components/TaskModal.jsx";
import { TaskTable } from "../components/TaskTable.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useAppData } from "../hooks/useAppData.js";

const statuses = ["TODO", "IN_PROGRESS", "DONE"];
const priorities = ["LOW", "MEDIUM", "HIGH"];
const sortOptions = [
  { label: "Due Date", value: "ASC" },
  { label: "Latest Due", value: "DESC" }
];

export function ProjectsPage() {
  const { user } = useAuth();
  const {
    addMember,
    createProject,
    createTask,
    deleteProject,
    deleteTask,
    loading,
    projects,
    removeMember,
    searchTerm,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    updateTask
  } = useAppData();

  const [viewMode, setViewMode] = useState("LIST");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberForm, setMemberForm] = useState({ email: "", role: "MEMBER" });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [pageError, setPageError] = useState("");

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
  const isAdmin = selectedProject?.currentUserRole === "ADMIN";

  const projectTasks = tasks
    .filter((task) => task.projectId === selectedProjectId)
    .filter((task) => (statusFilter === "ALL" ? true : task.status === statusFilter))
    .filter((task) => (priorityFilter === "ALL" ? true : task.priority === priorityFilter))
    .filter((task) => {
      const query = searchTerm.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return `${task.title} ${task.description || ""} ${task.assignedTo.name}`
        .toLowerCase()
        .includes(query);
    })
    .sort((left, right) => {
      if (sortOrder === "ASC") {
        return new Date(left.dueDate) - new Date(right.dueDate);
      }

      return new Date(right.dueDate) - new Date(left.dueDate);
    });

  function canEditTask(task) {
    return Boolean(
      isAdmin || task.createdBy.id === user.id || task.assignedTo.id === user.id
    );
  }

  function canDeleteTask(task) {
    return Boolean(isAdmin || task.createdBy.id === user.id);
  }

  function canChangeStatus(task) {
    return Boolean(isAdmin || task.assignedTo.id === user.id);
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    setPageError("");

    try {
      await createProject(projectForm);
      setProjectForm({ name: "", description: "" });
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function handleAddMember(event) {
    event.preventDefault();
    setPageError("");

    try {
      await addMember(selectedProject.id, memberForm);
      setMemberForm({ email: "", role: "MEMBER" });
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function handleSaveTask(payload) {
    setPageError("");

    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }

      setTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function handleDeleteTask(task) {
    if (!canDeleteTask(task)) {
      setPageError("You do not have permission to delete that task.");
      return;
    }

    try {
      await deleteTask(task.id);
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function handleStatusDrop(taskId, nextStatus) {
    const task = projectTasks.find((item) => item.id === Number(taskId));

    if (!task || !canChangeStatus(task) || task.status === nextStatus) {
      return;
    }

    try {
      await updateTask(task.id, { status: nextStatus });
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function handleRemoveMember(userId) {
    try {
      await removeMember(selectedProject.id, userId);
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function handleDeleteProject() {
    try {
      await deleteProject(selectedProject.id);
    } catch (error) {
      setPageError(error.message);
    }
  }

  function openCreateTask() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function openEditTask(task) {
    if (!canEditTask(task)) {
      setPageError("You do not have permission to edit that task.");
      return;
    }

    setEditingTask(task);
    setTaskModalOpen(true);
  }

  return (
    <div className="workspace-grid">
      <aside className="project-sidebar panel">
        <div className="panel-header">
          <h2>Projects</h2>
          <span>{projects.length}</span>
        </div>

        <div className="project-list">
          {projects.map((project) => (
            <button
              key={project.id}
              className={project.id === selectedProjectId ? "project-pill active" : "project-pill"}
              type="button"
              onClick={() => setSelectedProjectId(project.id)}
            >
              <strong>{project.name}</strong>
              <span>
                {project.currentUserRole} · {project.taskCount} tasks
              </span>
            </button>
          ))}
        </div>

        <form className="stack-form" onSubmit={handleCreateProject}>
          <h3>Create Project</h3>
          <label>
            Name
            <input
              name="name"
              onChange={(event) =>
                setProjectForm((current) => ({ ...current, name: event.target.value }))
              }
              required
              value={projectForm.name}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              onChange={(event) =>
                setProjectForm((current) => ({ ...current, description: event.target.value }))
              }
              rows="3"
              value={projectForm.description}
            />
          </label>
          <button className="primary-button" type="submit">
            Create Project
          </button>
        </form>
      </aside>

      <section className="workspace-main">
        {selectedProject ? (
          <>
            <div className="panel project-headline">
              <div>
                <p className="section-kicker">Project Workspace</p>
                <h1>{selectedProject.name}</h1>
                <p>{selectedProject.description || "No description yet."}</p>
              </div>
              <div className="headline-actions">
                <button className="primary-button" type="button" onClick={openCreateTask}>
                  New Task
                </button>
                {isAdmin ? (
                  <button className="ghost-danger" type="button" onClick={handleDeleteProject}>
                    Delete Project
                  </button>
                ) : null}
              </div>
            </div>

            <div className="workspace-toolbar panel">
              <div className="workspace-toolbar__controls">
                <div className="toggle-row toggle-row--colored">
                  <span className="section-label">View</span>
                  <div className="pill-group">
                    <button
                      className={viewMode === "KANBAN" ? "active-toggle color-toggle color-toggle--board" : "color-toggle"}
                      onClick={() => setViewMode("KANBAN")}
                      type="button"
                    >
                      Board
                    </button>
                    <button
                      className={viewMode === "LIST" ? "active-toggle color-toggle color-toggle--list" : "color-toggle"}
                      onClick={() => setViewMode("LIST")}
                      type="button"
                    >
                      List
                    </button>
                  </div>
                </div>

                <div className="filter-chip-block">
                  <span className="section-label">Status</span>
                  <div className="pill-group">
                    <button
                      className={statusFilter === "ALL" ? "active-toggle color-toggle color-toggle--all" : "color-toggle"}
                      onClick={() => setStatusFilter("ALL")}
                      type="button"
                    >
                      All Statuses
                    </button>
                    {statuses.map((status) => (
                      <button
                        key={status}
                        className={statusFilter === status ? `active-toggle color-toggle color-toggle--${status.toLowerCase()}` : "color-toggle"}
                        onClick={() => setStatusFilter(status)}
                        type="button"
                      >
                        {status === "IN_PROGRESS" ? "In Progress" : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-chip-block">
                  <span className="section-label">Priority</span>
                  <div className="pill-group">
                    <button
                      className={priorityFilter === "ALL" ? "active-toggle color-toggle color-toggle--all" : "color-toggle"}
                      onClick={() => setPriorityFilter("ALL")}
                      type="button"
                    >
                      All Priorities
                    </button>
                    {priorities.map((priority) => (
                      <button
                        key={priority}
                        className={priorityFilter === priority ? `active-toggle color-toggle color-toggle--${priority.toLowerCase()}` : "color-toggle"}
                        onClick={() => setPriorityFilter(priority)}
                        type="button"
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-chip-block">
                  <span className="section-label">Due Date</span>
                  <div className="pill-group">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className={sortOrder === option.value ? "active-toggle color-toggle color-toggle--due" : "color-toggle"}
                        onClick={() => setSortOrder(option.value)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {pageError ? <p className="form-error">{pageError}</p> : null}
            {loading ? <p>Refreshing project data...</p> : null}

            {viewMode === "KANBAN" ? (
              <div className="kanban-grid">
                {statuses.map((status) => (
                  <section
                    className="kanban-column panel"
                    key={status}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleStatusDrop(event.dataTransfer.getData("text/plain"), status);
                    }}
                  >
                    <div className="panel-header">
                      <h2>{status.replace("_", " ")}</h2>
                      <span>{projectTasks.filter((task) => task.status === status).length}</span>
                    </div>
                    <div className="kanban-stack">
                      {projectTasks
                        .filter((task) => task.status === status)
                        .map((task) => (
                          <div
                            key={task.id}
                            onDragStart={(event) => {
                              if (canChangeStatus(task)) {
                                event.dataTransfer.setData("text/plain", String(task.id));
                              }
                            }}
                          >
                            <TaskCard
                              task={task}
                              canChangeStatus={canChangeStatus}
                              canDelete={canDeleteTask}
                              canEdit={canEditTask}
                              onDelete={handleDeleteTask}
                              onEdit={openEditTask}
                            />
                          </div>
                        ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <TaskTable
                tasks={projectTasks}
                canDelete={canDeleteTask}
                canEdit={canEditTask}
                onDelete={handleDeleteTask}
                onEdit={openEditTask}
              />
            )}

            <section className="member-layout">
              <article className="panel">
                <div className="panel-header">
                  <h2>Members</h2>
                  <span>{selectedProject.members.length}</span>
                </div>
                <div className="member-list">
                  {selectedProject.members.map((member) => (
                    <div className="member-item" key={member.id}>
                      <div>
                        <strong>{member.name}</strong>
                        <p>
                          {member.email} · {member.role}
                        </p>
                      </div>
                      {isAdmin ? (
                        <button type="button" onClick={() => handleRemoveMember(member.id)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>

              {isAdmin ? (
                <article className="panel">
                  <div className="panel-header">
                    <h2>Add Member</h2>
                  </div>
                  <form className="stack-form" onSubmit={handleAddMember}>
                    <label>
                      User Email
                      <input
                        onChange={(event) =>
                          setMemberForm((current) => ({ ...current, email: event.target.value }))
                        }
                        required
                        type="email"
                        value={memberForm.email}
                      />
                    </label>
                    <label>
                      Role
                      <select
                        onChange={(event) =>
                          setMemberForm((current) => ({ ...current, role: event.target.value }))
                        }
                        value={memberForm.role}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </label>
                    <button className="primary-button" type="submit">
                      Add to Project
                    </button>
                  </form>
                </article>
              ) : null}
            </section>
          </>
        ) : (
          <div className="panel empty-state">
            <h1>Create your first project</h1>
            <p>The workspace is ready. Start with a project so tasks and dashboards have somewhere to live.</p>
          </div>
        )}
      </section>

      <TaskModal
        open={taskModalOpen}
        project={selectedProject}
        task={editingTask}
        currentUser={user}
        isAdmin={Boolean(isAdmin)}
        canManageAssignment={Boolean(isAdmin)}
        canSetStatus={canChangeStatus}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
}
