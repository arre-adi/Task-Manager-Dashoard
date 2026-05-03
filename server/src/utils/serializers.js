export function sanitizeUser(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    avatarUrl: row.avatar_url
  };
}

export function serializeProject(row) {
  const members = Array.isArray(row.members)
    ? row.members
        .filter((member) => member && member.id !== null)
        .map((member) => ({
          id: Number(member.id),
          name: member.name,
          email: member.email,
          role: member.role,
          avatarUrl: member.avatar_url
        }))
    : [];

  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    createdBy: Number(row.created_by),
    createdAt: row.created_at,
    currentUserRole: row.current_user_role,
    taskCount: Number(row.task_count || 0),
    members
  };
}

export function serializeTask(row) {
  return {
    id: Number(row.id),
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    projectId: Number(row.project_id),
    projectName: row.project_name,
    createdBy: {
      id: Number(row.created_by_id),
      name: row.created_by_name,
      email: row.created_by_email,
      avatarUrl: row.created_by_avatar_url
    },
    assignedTo: {
      id: Number(row.assigned_to_id),
      name: row.assigned_to_name,
      email: row.assigned_to_email,
      avatarUrl: row.assigned_to_avatar_url
    }
  };
}

