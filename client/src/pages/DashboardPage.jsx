import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectModal } from "../components/ProjectModal.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useAppData } from "../hooks/useAppData.js";

function isOverdue(task) {
  return task.status !== "DONE" && new Date(task.dueDate) < new Date(new Date().toDateString());
}

function isDueSoon(task) {
  const today = new Date(new Date().toDateString());
  const inThreeDays = new Date(today);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const due = new Date(task.dueDate);

  return task.status !== "DONE" && due >= today && due <= inThreeDays;
}

function priorityRank(priority) {
  return { HIGH: 0, MEDIUM: 1, LOW: 2 }[priority] ?? 3;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject, projects, tasks, loading, error, searchTerm } = useAppData();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DUE_ASC");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectError, setProjectError] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchedTasks = normalizedSearch
    ? tasks.filter((task) => {
        const haystack = `${task.title} ${task.projectName} ${task.assignedTo.name}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : tasks;

  const visibleTasks = searchedTasks
    .filter((task) => (statusFilter === "ALL" ? true : task.status === statusFilter))
    .sort((left, right) => {
      if (sortOrder === "DUE_DESC") {
        return new Date(right.dueDate) - new Date(left.dueDate);
      }

      if (sortOrder === "PRIORITY") {
        return priorityRank(left.priority) - priorityRank(right.priority);
      }

      return new Date(left.dueDate) - new Date(right.dueDate);
    });

  const todoCount = visibleTasks.filter((task) => task.status === "TODO").length;
  const inProgressCount = visibleTasks.filter((task) => task.status === "IN_PROGRESS").length;
  const doneCount = visibleTasks.filter((task) => task.status === "DONE").length;
  const overdueTasks = visibleTasks.filter(isOverdue);
  const dueSoonTasks = visibleTasks.filter(isDueSoon);
  const myTasks = visibleTasks.filter((task) => task.assignedTo.id === user.id);
  const todoTasks = visibleTasks.filter((task) => task.status === "TODO").slice(0, 4);
  const activeTasks = visibleTasks
    .filter((task) => task.status === "IN_PROGRESS" || task.status === "DONE")
    .slice(0, 5);

  const groupedMyTasks = {
    TODO: myTasks.filter((task) => task.status === "TODO"),
    IN_PROGRESS: myTasks.filter((task) => task.status === "IN_PROGRESS"),
    DONE: myTasks.filter((task) => task.status === "DONE")
  };

  function progressForTask(task) {
    if (task.status === "DONE") {
      return 100;
    }

    if (task.status === "IN_PROGRESS") {
      return 64;
    }

    return 18;
  }

  async function handleCreateProject(payload) {
    setProjectError("");

    try {
      await createProject(payload);
      setProjectModalOpen(false);
      navigate("/projects");
    } catch (createError) {
      setProjectError(createError.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="dashboard-intro">
        <div className="dashboard-intro__copy">
          <p>
            {projects.length} active project{projects.length === 1 ? "" : "s"} in your workspace
          </p>
        </div>
        {loading ? <p>Refreshing workspace data...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
      </section>

      <section className="stats-grid">
        <StatCard label="TODO" value={todoCount} />
        <StatCard label="IN PROGRESS" tone="warning" value={inProgressCount} />
        <StatCard label="DONE" tone="success" value={doneCount} />
      </section>

      <section className="panel">
        <div className="panel-toolbar">
          <div className="toolbar-actions">
            <label className="toolbar-control">
              <span>Filter</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">All</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <label className="toolbar-control">
              <span>Sort</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="DUE_ASC">Due date</option>
                <option value="DUE_DESC">Latest due</option>
                <option value="PRIORITY">Priority</option>
              </select>
            </label>
          </div>
          <button className="dark-pill" type="button" onClick={() => setProjectModalOpen(true)}>
            + New Project
          </button>
        </div>
      </section>

      <section className="task-stack-section">
        <div className="section-label-row">
          <span className="section-label">Todo</span>
        </div>
        <div className="task-list">
          {todoTasks.length ? (
            todoTasks.map((task) => (
              <article className="task-row" key={task.id}>
                <div className="task-row__main">
                  <strong>{task.title}</strong>
                  <p>{task.projectName}</p>
                </div>
                <div className="task-row__meta">
                  <span className={`status-pill status-pill--${task.status.toLowerCase()}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  <span className={`priority-pill priority-pill--${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className="task-row__deadline">
                    {isOverdue(task)
                      ? "Overdue"
                      : `${Math.max(0, Math.ceil((new Date(task.dueDate) - new Date()) / 86400000))} days left`}
                  </span>
                </div>
                <div className="task-row__progress">
                  <div className="progress-track">
                    <span style={{ width: `${progressForTask(task)}%` }} />
                  </div>
                  <strong>{progressForTask(task)}%</strong>
                </div>
              </article>
            ))
          ) : (
            <div className="task-row task-row--empty">
              <p>No todo tasks match your current filters.</p>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-columns">
        <article className="panel">
          <div className="panel-header panel-header--tight">
            <span className="section-label">Overdue Tasks</span>
            <span>{overdueTasks.length}</span>
          </div>
          <div className="stack-list">
            {overdueTasks.length ? (
              overdueTasks.map((task) => (
                <div className="mini-task" key={task.id}>
                  <strong>{task.title}</strong>
                  <span>
                    {task.projectName} · {task.assignedTo.name}
                  </span>
                </div>
              ))
            ) : (
              <p>No overdue work right now.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header panel-header--tight">
            <span className="section-label">Due Soon</span>
            <span>{dueSoonTasks.length}</span>
          </div>
          <div className="stack-list">
            {dueSoonTasks.length ? (
              dueSoonTasks.map((task) => (
                <div className="mini-task" key={task.id}>
                  <strong>{task.title}</strong>
                  <span>
                    Due {new Date(task.dueDate).toLocaleDateString("en-IN")} · {task.projectName}
                  </span>
                </div>
              ))
            ) : (
              <p>No deadlines inside the next three days.</p>
            )}
          </div>
        </article>
      </section>

      <section className="task-stack-section">
        <div className="section-label-row">
          <span className="section-label">Active Projects</span>
        </div>
        <div className="task-list">
          {activeTasks.length ? (
            activeTasks.map((task) => (
              <article className="task-row" key={task.id}>
                <div className="task-row__main">
                  <strong>{task.title}</strong>
                  <p>
                    {task.projectName} · Assigned to {task.assignedTo.name}
                  </p>
                </div>
                <div className="task-row__meta">
                  <span className={`status-pill status-pill--${task.status.toLowerCase()}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  <span className={`priority-pill priority-pill--${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="task-row__progress">
                  <div className="progress-track">
                    <span style={{ width: `${progressForTask(task)}%` }} />
                  </div>
                  <strong>{progressForTask(task)}%</strong>
                </div>
              </article>
            ))
          ) : (
            <div className="task-row task-row--empty">
              <p>No active tasks yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header panel-header--tight">
          <h2>My Tasks</h2>
          <span>{myTasks.length}</span>
        </div>
        <div className="my-task-grid">
          {Object.entries(groupedMyTasks).map(([status, groupedTasks]) => (
            <div className="my-task-column" key={status}>
              <h3>{status.replace("_", " ")}</h3>
              <span className="my-task-column__count">{groupedTasks.length}</span>
            </div>
          ))}
        </div>
      </section>

      <ProjectModal
        open={projectModalOpen}
        error={projectError}
        onClose={() => {
          setProjectModalOpen(false);
          setProjectError("");
        }}
        onSave={handleCreateProject}
      />
    </div>
  );
}
