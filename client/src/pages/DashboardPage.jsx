import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectModal } from "../components/ProjectModal.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { TaskModal } from "../components/TaskModal.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useAppData } from "../hooks/useAppData.js";
import { getAvatarUrl } from "../utils/avatar.js";

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

function daysUntil(dueDate) {
  return Math.ceil((new Date(dueDate) - startOfToday()) / 86400000);
}

function formatDueLabel(task) {
  const delta = daysUntil(task.dueDate);

  if (delta < 0) {
    return `${Math.abs(delta)} day${Math.abs(delta) === 1 ? "" : "s"} overdue`;
  }

  if (delta === 0) {
    return "Due today";
  }

  return `${delta} day${delta === 1 ? "" : "s"} left`;
}

function compareTasks(left, right) {
  const leftOverdue = isOverdue(left);
  const rightOverdue = isOverdue(right);

  if (leftOverdue !== rightOverdue) {
    return leftOverdue ? -1 : 1;
  }

  const leftSoon = isDueSoon(left);
  const rightSoon = isDueSoon(right);

  if (leftSoon !== rightSoon) {
    return leftSoon ? -1 : 1;
  }

  return new Date(left.dueDate) - new Date(right.dueDate);
}

function activityCopy(task) {
  if (task.status === "DONE") {
    return `${task.title} marked as done`;
  }

  if (task.status === "IN_PROGRESS") {
    return `${task.title} moved into progress`;
  }

  return `${task.title} assigned in ${task.projectName}`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    createProject,
    createTask,
    error,
    loading,
    projects,
    searchTerm,
    selectedProjectId,
    tasks
  } = useAppData();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingStatus, setViewingStatus] = useState(null);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || projects[0] || null;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleTasks = (normalizedSearch
    ? tasks.filter((task) => {
      const haystack = [
        task.title,
        task.description || "",
        task.assignedTo.name,
        task.projectName
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    })
    : tasks).filter(task => {
      if (!viewingStatus) return true;
      const project = projects.find(p => p.id === task.projectId);
      if (!project) return true;
      
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      if (viewingStatus === "DONE") {
        return projectTasks.length > 0 && projectTasks.every(t => t.status === "DONE");
      }
      if (viewingStatus === "IN_PROGRESS") {
        return projectTasks.some(t => t.status === "IN_PROGRESS");
      }
      if (viewingStatus === "TODO") {
        return projectTasks.length > 0 && projectTasks.every(t => t.status === "TODO");
      }
      return true;
    });

  const myTasks = visibleTasks
    .filter((task) => task.assignedTo.id === user.id)
    .sort(compareTasks)
    .slice(0, 6);
  const overdueTasks = visibleTasks.filter(isOverdue).sort(compareTasks).slice(0, 5);
  const dueSoonTasks = visibleTasks.filter((task) => !isOverdue(task) && isDueSoon(task)).sort(compareTasks).slice(0, 5);
  const recentActivity = [...visibleTasks]
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
    .slice(0, 5);
  const projectStats = projects.reduce(
    (stats, project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      if (projectTasks.length > 0 && projectTasks.every((t) => t.status === "DONE")) {
        stats.ended++;
      } else if (projectTasks.some((t) => t.status === "IN_PROGRESS")) {
        stats.running++;
      } else {
        stats.pending++;
      }
      return stats;
    },
    { ended: 0, running: 0, pending: 0 }
  );

  const activeMembers = Array.from(
    visibleTasks
      .filter((task) => task.status !== "DONE")
      .reduce((members, task) => {
        const current = members.get(task.assignedTo.id) || {
          id: task.assignedTo.id,
          name: task.assignedTo.name,
          avatarUrl: task.assignedTo.avatarUrl,
          activeTasks: 0,
          projectNames: new Set()
        };

        current.activeTasks += 1;
        current.projectNames.add(task.projectName);
        members.set(task.assignedTo.id, current);

        return members;
      }, new Map())
      .values()
  )
    .sort((left, right) => right.activeTasks - left.activeTasks)
    .slice(0, 5);

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

  async function handleCreateTask(payload) {
    setTaskError("");

    try {
      await createTask(payload);
      setTaskModalOpen(false);
      navigate("/projects");
    } catch (createError) {
      setTaskError(createError.message);
    }
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header dashboard-header--html-copy">
        <div>
          <h1 className="page-title-large">Hey {user?.name.split(" ")[0]}!</h1>
          <p className="page-subtitle">Plan, prioritize, and accomplish your tasks with ease.</p>
          {loading ? <p className="dashboard-inline-state">Refreshing workspace data...</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
        </div>
        <div className="dashboard-header__actions">
          <button className="primary-button dashboard-add-project-button" type="button" onClick={() => setProjectModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            Add Project
          </button>
        </div>
      </header>

      <section className="dashboard-bento">
        <div className="dashboard-bento__status dashboard-bento__status--html-copy">
          <StatCard
            label="Total Projects"
            onClick={() => {
              setViewingStatus(null);
              navigate("/projects");
            }}
            tone="todo"
            value={projects.length}
          />
          <StatCard
            label="Ended Projects"
            onClick={() => setViewingStatus("DONE")}
            tone="default"
            value={projectStats.ended}
          />
          <StatCard
            label="Running Projects"
            onClick={() => setViewingStatus("IN_PROGRESS")}
            tone="default"
            value={projectStats.running}
          />
          <StatCard
            label="Pending Projects"
            onClick={() => setViewingStatus("TODO")}
            tone="default"
            value={projectStats.pending}
          />
        </div>

        <article className="panel bento-card bento-card--primary">
          <div className="panel-header panel-header--compact">
            <div>
               <h2 style={{ fontWeight: "bold" }}>
                 {viewingStatus ? `${viewingStatus.replace("_", " ")} PROJECTS TASKS` : "MY TASKS"}
               </h2>
               {viewingStatus && (
                 <button className="inline-link-button" onClick={() => setViewingStatus(null)} style={{ fontSize: "12px", color: "var(--primary-green)" }}>
                   Clear filter
                 </button>
               )}
            </div>
            <button className="inline-link-button" type="button" onClick={() => navigate("/projects")}>
              Open board
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="task-feed">
            {myTasks.length ? (
              myTasks.map((task) => (
                <article
                  className="compact-task-item"
                  key={task.id}
                  onClick={() => setViewingTask(task)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="compact-task-item__main">
                    <strong>{task.title}</strong>
                    <p>{task.projectName}</p>
                  </div>
                  <div className="compact-task-item__meta">
                    <span className={`status-pill status-pill--${task.status.toLowerCase()}`}>
                      {task.status.replace("_", " ")}
                    </span>
                    <span className={`priority-pill priority-pill--${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className="due-chip">{formatDueLabel(task)}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-placeholder">
                <strong>{viewingStatus ? `No ${viewingStatus.toLowerCase().replace("_", " ")} projects found.` : "No tasks assigned to you yet."}</strong>
                <p>{viewingStatus ? "Try clearing the filter to see all your active work." : "Your personal queue will show up here once work gets assigned."}</p>
              </div>
            )}
          </div>
        </article>

        <article className="panel bento-card bento-card--alert">
          <div className="panel-header panel-header--compact">
            <div>
              <h2 style={{ fontWeight: "bold" }}>OVERDUE</h2>
            </div>
            <span className="count-badge">{overdueTasks.length}</span>
          </div>

          <div className="stacked-list">
            {overdueTasks.length ? (
              overdueTasks.map((task) => (
                <article
                  className="mini-list-item mini-list-item--alert"
                  key={task.id}
                  onClick={() => setViewingTask(task)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{task.title}</strong>
                  <p>{task.projectName}</p>
                  <span>{formatDueLabel(task)}</span>
                </article>
              ))
            ) : (
              <div className="empty-placeholder empty-placeholder--soft">
                <strong>No overdue tasks.</strong>
                <p>Your team is clear on urgent carryover right now.</p>
              </div>
            )}
          </div>
        </article>

        <article className="panel bento-card">
          <div className="panel-header panel-header--compact">
            <div>
               <h2 style={{ fontWeight: "bold" }}>DUE SOON</h2>
            </div>
            <span className="count-badge">{dueSoonTasks.length}</span>
          </div>

          <div className="stacked-list">
            {dueSoonTasks.length ? (
              dueSoonTasks.map((task) => (
                <article
                  className="mini-list-item mini-list-item--warning"
                  key={task.id}
                  onClick={() => setViewingTask(task)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{task.title}</strong>
                  <p>{task.assignedTo.name}</p>
                  <span>{formatDueLabel(task)}</span>
                </article>
              ))
            ) : (
              <div className="empty-placeholder empty-placeholder--soft">
                <strong>No close deadlines.</strong>
                <p>Nothing is due inside the next three days.</p>
              </div>
            )}
          </div>
        </article>

        <article className="panel bento-card">
          <div className="panel-header panel-header--compact">
            <div>
               <h2 style={{ fontWeight: "bold" }}>RECENT ACTIVITY</h2>
            </div>
          </div>

          <div className="activity-feed">
            {recentActivity.length ? (
              recentActivity.map((task) => (
                <article className="activity-item" key={task.id}>
                  <div className="activity-item__dot" />
                  <div>
                    <strong>{activityCopy(task)}</strong>
                    <p>
                      {task.projectName} · {new Date(task.updatedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-placeholder empty-placeholder--soft">
                <strong>No recent updates yet.</strong>
                <p>Task movement will appear here as soon as the team starts working.</p>
              </div>
            )}
          </div>
        </article>

        <article className="panel bento-card">
          <div className="panel-header panel-header--compact">
            <div>
              <h2 style={{ fontWeight: "bold" }}>ACTIVE MEMBERS</h2>
            </div>
          </div>

          <div className="active-member-list">
            {activeMembers.length ? (
              activeMembers.map((member) => (
                <article className="active-member-item" key={member.id}>
                  <div className="active-member-item__avatar">
                    {member.avatarUrl ? (
                      <img
                        alt={member.name}
                        src={getAvatarUrl(member.avatarUrl)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </div>
                  <div className="active-member-item__body">
                    <strong>{member.name}</strong>
                    <p>{Array.from(member.projectNames).slice(0, 2).join(", ")}</p>
                  </div>
                  <span className="active-member-item__count">{member.activeTasks}</span>
                </article>
              ))
            ) : (
              <div className="empty-placeholder empty-placeholder--soft">
                <strong>No active members.</strong>
                <p>Active team members appear here when tasks are in motion.</p>
              </div>
            )}
          </div>
        </article>

        {viewingTask && (
          <div className="modal-backdrop" onClick={() => setViewingTask(null)}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-card__header">
                <div>
                  <p className="eyebrow">{viewingTask.projectName}</p>
                  <h3>{viewingTask.title}</h3>
                </div>
                <button className="modal-close-button" onClick={() => setViewingTask(null)}>
                  &times;
                </button>
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>{viewingTask.description || "No description provided."}</p>
                <div className="task-meta">
                  <span className={`status-pill status-pill--${viewingTask.status.toLowerCase()}`}>
                    {viewingTask.status}
                  </span>
                  <span className={`badge badge--${viewingTask.priority.toLowerCase()}`}>
                    {viewingTask.priority}
                  </span>
                  <span>Due {new Date(viewingTask.dueDate).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewingStatus && (
          <div className="modal-backdrop" onClick={() => setViewingStatus(null)}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-card__header">
                <div>
                  <p className="eyebrow">Status View</p>
                  <h3>Tasks in {viewingStatus.replace("_", " ")}</h3>
                </div>
                <button className="modal-close-button" onClick={() => setViewingStatus(null)}>
                  &times;
                </button>
              </div>
              <div className="stacked-list">
                {visibleTasks
                  .filter((task) => task.status === viewingStatus)
                  .map((task) => (
                    <article
                      className="compact-task-item"
                      key={task.id}
                      onClick={() => {
                        setViewingStatus(null);
                        setViewingTask(task);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="compact-task-item__main">
                        <strong>{task.title}</strong>
                        <p>{task.projectName}</p>
                      </div>
                      <div className="compact-task-item__meta">
                        <span className={`priority-pill priority-pill--${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <span className="due-chip">{formatDueLabel(task)}</span>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
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
        task={null}
        currentUser={user}
        isAdmin={selectedProject?.currentUserRole === "ADMIN"}
        canManageAssignment={selectedProject?.currentUserRole === "ADMIN"}
        canSetStatus={() => true}
        onClose={() => {
          setTaskModalOpen(false);
          setTaskError("");
        }}
        onSave={handleCreateTask}
      />
    </div>
  );
}
