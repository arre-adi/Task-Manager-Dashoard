import { pool } from "../db/pool.js";
import { forbidden, notFound } from "../utils/http.js";

export async function getMembership(userId, projectId, client = pool) {
  const { rows } = await client.query(
    `SELECT pm.id, pm.user_id, pm.project_id, pm.role
     FROM project_members pm
     WHERE pm.user_id = $1 AND pm.project_id = $2`,
    [userId, projectId]
  );

  return rows[0] || null;
}

export async function ensureProjectMember(userId, projectId, client = pool) {
  const membership = await getMembership(userId, projectId, client);

  if (!membership) {
    throw forbidden("You are not a member of this project");
  }

  return membership;
}

export async function ensureProjectAdmin(userId, projectId, client = pool) {
  const membership = await ensureProjectMember(userId, projectId, client);

  if (membership.role !== "ADMIN") {
    throw forbidden("Admin access is required for this project action");
  }

  return membership;
}

export async function ensureUserExists(userId, client = pool) {
  const { rows } = await client.query("SELECT id FROM users WHERE id = $1", [userId]);

  if (!rows[0]) {
    throw notFound("User not found");
  }

  return rows[0];
}

export async function ensureProjectExists(projectId, client = pool) {
  const { rows } = await client.query("SELECT id FROM projects WHERE id = $1", [projectId]);

  if (!rows[0]) {
    throw notFound("Project not found");
  }

  return rows[0];
}

export async function ensureAssignableMember(projectId, userId, client = pool) {
  const { rows } = await client.query(
    `SELECT id
     FROM project_members
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );

  if (!rows[0]) {
    throw forbidden("Assigned user must be a member of the project");
  }

  return rows[0];
}

