import { FolderPlus, Plus } from "lucide-react";
import { useState } from "react";
import { ProjectModal } from "../components/ProjectModal.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { TaskCard } from "../components/TaskCard.jsx";
import { TaskModal } from "../components/TaskModal.jsx";
import { TaskTable } from "../components/TaskTable.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useAppData } from "../hooks/useAppData.js";

const statuses = ["TODO", "IN_PROGRESS", "DONE"];

function startOfToday() {
  return new Date(new Date().toDateString());
}

function isOverdue(task) {
  return task.status !== "DONE" && new Date(task.dueDate) < startOfToday();
}

function isDueSoon(task) {
  const today = startOfToday();
  const due = new Date(task.dueDate);
  const inThreeDays = new Date(today);
  inThreeDays.setDate(inThreeDays.getDate() + 3);

  return task.status !== "DONE" && due >= today && due <= inThreeDays;
}

function rankSection(task) {
  if (isOverdue(task)) {
    return 0;
  }

  if (isDueSoon(task)) {
    return 1;
  }

  if (task.status === "TODO") {
    return 2;
  }

  return 3;
}

function filterTask(task, searchTerm, statusFilter, priorityFilter) {
  if (statusFilter !== "ALL" && task.status !== statusFilter) {
    return false;
  }

  if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
    return false;
  }

  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [task.title, task.description || "", task.assignedTo.name, task.projectName]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function sectionedTasks(projectTasks) {
  const overdue = [];
  const dueSoon = [];
  const todo = [];
  const active = [];

  projectTasks.forEach((task) => {
    if (isOverdue(task)) {
      overdue.push(task);
      return;
    }

    if (isDueSoon(task)) {
      dueSoon.push(task);
      return;
    }

    if (task.status === "TODO") {
      todo.push(task);
      return;
    }

    active.push(task);
  });

  return [
    { key: "todo", title: "Todo",  tasks: todo },
    { key: "overdue", title: "Overdue Tasks",  tasks: overdue, tone: "alert" },
    { key: "dueSoon", title: "Due Soon",  tasks: dueSoon, tone: "warning" },
    { key: "active", title: "Active Tasks",tasks: active }
  ];
}

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
  const [memberForm, setMemberForm] = useState({ email: "", role: "MEMBER" });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [pageError, setPageError] = useState("");
  const [projectError, setProjectError] = useState("");

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
  const isAdmin = selectedProject?.currentUserRole === "ADMIN";

  const allProjectTasks = tasks
    .filter((task) => task.projectId === selectedProjectId)
    .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate));

  const projectTasks = allProjectTasks
    .filter((task) => filterTask(task, searchTerm, statusFilter, priorityFilter))
    .sort((left, right) => {
      if (sortOrder === "DESC") {
        return new Date(right.dueDate) - new Date(left.dueDate);
      }

      return new Date(left.dueDate) - new Date(right.dueDate);
    });

  const taskSections = sectionedTasks(projectTasks);
  const todoCount = allProjectTasks.filter((task) => task.status === "TODO").length;
  const inProgressCount = allProjectTasks.filter((task) => task.status === "IN_PROGRESS").length;
  const doneCount = allProjectTasks.filter((task) => task.status === "DONE").length;

  function canEditTask(task) {
    return Boolean(isAdmin || task.createdBy.id === user.id || task.assignedTo.id === user.id);
  }

  function canDeleteTask(task) {
    return Boolean(isAdmin || task.createdBy.id === user.id);
  }

  function canChangeStatus(task) {
    return Boolean(isAdmin || task.assignedTo.id === user.id);
  }

  async function handleCreateProject(payload) {
    setProjectError("");

    try {
      await createProject(payload);
      setProjectModalOpen(false);
    } catch (error) {
      setProjectError(error.message);
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
        <div className="project-sidebar__header">
          <p className="section-kicker">Projects</p>
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

        <button className="secondary-button project-sidebar__create" type="button" onClick={() => setProjectModalOpen(true)}>
          <FolderPlus size={16} strokeWidth={2} />
          New Project
        </button>
      </aside>

      <section className="workspace-main">
        {selectedProject ? (
          <>
            <section className="project-summary panel">
              <div className="project-summary__copy">
                <p className="section-kicker">Project Workspace</p>
                <h1 className="page-title-large">{selectedProject.name}</h1>
                <p className="page-subtitle">{selectedProject.description || "No description yet."}</p>
              </div>
              <div className="project-summary__actions">
                <button className="primary-button" type="button" onClick={openCreateTask}>
                  <Plus size={16} strokeWidth={2} />
                  New Task
                </button>
                {isAdmin ? (
                  <button className="ghost-danger" type="button" onClick={handleDeleteProject}>
                    Delete Project
                  </button>
                ) : null}
              </div>
            </section>

            <section className="stats-grid">
              <StatCard label="Todo" value={todoCount} subtext="Queued in this project" tone="todo" />
              <StatCard
                label="In Progress"
                value={inProgressCount}
                subtext="Currently being worked on"
                tone="active"
              />
              <StatCard label="Done" value={doneCount} subtext="Completed outcomes" tone="done" />
            </section>

            <section className="panel filter-panel">
              <div className="filter-panel__row">
                <div className="view-tabs">
                  <button
                    className={viewMode === "LIST" ? "view-tab active" : "view-tab"}
                    onClick={() => setViewMode("LIST")}
                    type="button"
                  >
                    List
                  </button>
                  <button
                    className={viewMode === "KANBAN" ? "view-tab active" : "view-tab"}
                    onClick={() => setViewMode("KANBAN")}
                    type="button"
                  >
                    Board
                  </button>
                </div>

                <div className="workspace-filters">
                  <label className="toolbar-control">
                    <span>Status</span>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="ALL">All Statuses</option>
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </label>

                  <label className="toolbar-control">
                    <span>Priority</span>
                    <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                      <option value="ALL">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </label>

                  <label className="toolbar-control">
                    <span>Sort</span>
                    <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                      <option value="ASC">Due date</option>
                      <option value="DESC">Latest due</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

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
                    <div className="panel-header panel-header--compact">
                      <h2>{status.replace("_", " ")}</h2>
                      <span className="count-badge">{projectTasks.filter((task) => task.status === status).length}</span>
                    </div>
                    <div className="kanban-stack">
                      {projectTasks
                        .filter((task) => task.status === status)
                        .sort((left, right) => rankSection(left) - rankSection(right))
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
              <div className="task-section-stack">
                {taskSections.map((section) => (
                  <section className={`panel task-section task-section--${section.tone || "default"}`} key={section.key}>
                    <div className="panel-header panel-header--compact">
                      <div>
                        <p className="section-kicker">{section.title}</p>
                        <h2>{section.description}</h2>
                      </div>
                      <span className="count-badge">{section.tasks.length}</span>
                    </div>
                    {section.tasks.length ? (
                      <TaskTable
                        tasks={section.tasks}
                        canDelete={canDeleteTask}
                        canEdit={canEditTask}
                        onDelete={handleDeleteTask}
                        onEdit={openEditTask}
                      />
                    ) : (
                      <div className="empty-placeholder empty-placeholder--soft">
                        <strong>No tasks in this section.</strong>
                        <p>As work moves, matching items will appear here automatically.</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            <section className="member-layout">
              <article className="panel">
                <div className="panel-header panel-header--compact">
                  <div>
                    <p className="section-kicker">Team Members</p>
                    <h2>People in this project</h2>
                  </div>
                  <span className="count-badge">{selectedProject.members.length}</span>
                </div>
                <div className="member-list">
                  {selectedProject.members.map((member) => (
                    <div className="member-item" key={member.id}>
                      <div>
                        <strong>{member.name}</strong>
                        <p>{member.email}</p>
                      </div>
                      <div className="member-item__meta">
                        <span className={`status-pill status-pill--${member.role === "ADMIN" ? "done" : "todo"}`}>
                          {member.role}
                        </span>
                        {isAdmin ? (
                          <button type="button" onClick={() => handleRemoveMember(member.id)}>
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {isAdmin ? (
                <article className="panel">
                  <div className="panel-header panel-header--compact">
                    <div>
                      <p className="section-kicker">Add Member</p>
                      <h2>Invite into this project</h2>
                    </div>
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
            <button className="primary-button" type="button" onClick={() => setProjectModalOpen(true)}>
              <FolderPlus size={16} strokeWidth={2} />
              New Project
            </button>
          </div>
        )}
      </section>

      <ProjectModal
        error={projectError}
        open={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setProjectError("");
        }}
        onSave={handleCreateProject}
      />

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
