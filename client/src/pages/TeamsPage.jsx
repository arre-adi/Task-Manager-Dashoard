import { useMemo } from "react";
import { useAppData } from "../hooks/useAppData.js";
import { getAvatarUrl } from "../utils/avatar.js";

export function TeamsPage() {
  const { projects, tasks } = useAppData();

  const members = useMemo(() => {
    const memberMap = new Map();

    projects.forEach((project) => {
      project.members.forEach((member) => {
        if (!memberMap.has(member.id)) {
          memberMap.set(member.id, {
            ...member,
            projects: new Set(),
            activeTasks: 0,
            totalTasks: 0
          });
        }

        memberMap.get(member.id).projects.add(project.name);
      });
    });

    tasks.forEach((task) => {
      const assignedMember = memberMap.get(task.assignedTo.id);

      if (!assignedMember) {
        return;
      }

      assignedMember.totalTasks += 1;

      if (task.status !== "DONE") {
        assignedMember.activeTasks += 1;
      }
    });

    return Array.from(memberMap.values())
      .map((member) => ({
        ...member,
        projects: Array.from(member.projects)
      }))
      .sort((left, right) => right.activeTasks - left.activeTasks || left.name.localeCompare(right.name));
  }, [projects, tasks]);

  return (
    <div className="page-grid">
      <section className="dashboard-header panel">
        <div>
          <h1 className="section-title">Team Members</h1>
        </div>
      </section>

      <section className="teams-grid">
        {members.map((member) => (
          <article className="team-card" key={member.id}>
            <div className="team-card__top">
              <div className="team-card__avatar">
                {member.avatarUrl ? (
                  <img
                    alt={member.name}
                    src={getAvatarUrl(member.avatarUrl)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  member.name.slice(0, 1)
                )}
              </div>
              <div className="team-card__identity">
                <strong>{member.name}</strong>
                <p>{member.email}</p>
              </div>
              <span className={`status-pill status-pill--${member.role === "ADMIN" ? "done" : "todo"}`}>
                {member.role}
              </span>
            </div>

            <div className="team-card__stats">
              <div>
                <span>Projects</span>
                <strong>{member.projects.length}</strong>
              </div>
              <div>
                <span>Active Tasks</span>
                <strong>{member.activeTasks}</strong>
              </div>
              <div>
                <span>Total Tasks</span>
                <strong>{member.totalTasks}</strong>
              </div>
            </div>

            <div className="team-card__projects">
              {member.projects.map((project) => (
                <span className="project-chip" key={project}>
                  {project}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
