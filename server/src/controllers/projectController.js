import { pool, withTransaction } from "../db/pool.js";
import {
  ensureProjectAdmin,
  ensureProjectExists
} from "../services/projectAccessService.js";
import { badRequest, forbidden, notFound } from "../utils/http.js";
import { serializeProject } from "../utils/serializers.js";
import {
  PROJECT_ROLES,
  assertEnum,
  assertPositiveInteger,
  assertRequired,
  isEmail
} from "../utils/validators.js";

const projectSelectQuery = `
  SELECT
    p.id,
    p.name,
    p.description,
    p.created_by,
    p.created_at,
    viewer.role AS current_user_role,
    COUNT(DISTINCT t.id)::INT AS task_count,
    COALESCE(
      JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
          'id', members.user_id,
          'name', member_user.name,
          'email', member_user.email,
          'role', members.role,
          'avatar_url', member_user.avatar_url
        )
      ) FILTER (WHERE members.id IS NOT NULL),
      '[]'
    ) AS members
  FROM projects p
  JOIN project_members viewer
    ON viewer.project_id = p.id
   AND viewer.user_id = $1
  LEFT JOIN tasks t
    ON t.project_id = p.id
  LEFT JOIN project_members members
    ON members.project_id = p.id
  LEFT JOIN users member_user
    ON member_user.id = members.user_id
  GROUP BY p.id, viewer.role
  ORDER BY p.created_at DESC
`;

export async function getProjects(req, res) {
  const { rows } = await pool.query(projectSelectQuery, [req.user.id]);
  res.json({ projects: rows.map(serializeProject) });
}

export async function createProject(req, res) {
  const { name, description } = req.body;

  assertRequired(name, "name");

  const project = await withTransaction(async (client) => {
    const insertedProject = await client.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by, created_at`,
      [name.trim(), description?.trim() || null, req.user.id]
    );

    const projectRow = insertedProject.rows[0];

    await client.query(
      `INSERT INTO project_members (user_id, project_id, role)
       VALUES ($1, $2, 'ADMIN')`,
      [req.user.id, projectRow.id]
    );

    const { rows } = await client.query(projectSelectQuery, [req.user.id]);
    return rows.find((row) => Number(row.id) === Number(projectRow.id));
  });

  res.status(201).json({ project: serializeProject(project) });
}

export async function deleteProject(req, res) {
  const projectId = assertPositiveInteger(req.params.id, "project id");

  await ensureProjectExists(projectId);
  await ensureProjectAdmin(req.user.id, projectId);

  await pool.query("DELETE FROM projects WHERE id = $1", [projectId]);

  res.status(204).send();
}

export async function addMember(req, res) {
  const projectId = assertPositiveInteger(req.params.id, "project id");
  const { email, userId, role } = req.body;

  await ensureProjectAdmin(req.user.id, projectId);

  const desiredRole = role || "MEMBER";
  assertEnum(desiredRole, PROJECT_ROLES, "role");

  const member = await withTransaction(async (client) => {
    let resolvedUserId = userId ? assertPositiveInteger(userId, "userId") : null;

    if (!resolvedUserId) {
      assertRequired(email, "email");

      if (!isEmail(email)) {
        badRequest("email must be valid");
      }

      const userLookup = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email.trim().toLowerCase()]
      );

      if (!userLookup.rows[0]) {
        throw notFound("No user found with that email");
      }

      resolvedUserId = Number(userLookup.rows[0].id);
    }

    if (resolvedUserId === req.user.id && desiredRole !== "ADMIN") {
      throw forbidden("You cannot downgrade yourself while adding membership");
    }

    try {
      await client.query(
        `INSERT INTO project_members (user_id, project_id, role)
         VALUES ($1, $2, $3)`,
        [resolvedUserId, projectId, desiredRole]
      );
    } catch (error) {
      if (error.code === "23505") {
        badRequest("User is already a member of this project");
      }

      throw error;
    }

    const { rows } = await client.query(projectSelectQuery, [req.user.id]);
    return rows.find((row) => Number(row.id) === projectId);
  });

  res.status(201).json({ project: serializeProject(member) });
}

export async function removeMember(req, res) {
  const projectId = assertPositiveInteger(req.params.id, "project id");
  const memberUserId = assertPositiveInteger(req.params.userId, "user id");

  await ensureProjectAdmin(req.user.id, projectId);

  await withTransaction(async (client) => {
    const membership = await client.query(
      `SELECT id, role
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, memberUserId]
    );

    if (!membership.rows[0]) {
      throw notFound("Project member not found");
    }

    if (memberUserId === req.user.id) {
      const { rows } = await client.query(
        `SELECT COUNT(*)::INT AS admin_count
         FROM project_members
         WHERE project_id = $1 AND role = 'ADMIN'`,
        [projectId]
      );

      if (Number(rows[0].admin_count) <= 1) {
        badRequest("Project must keep at least one admin");
      }
    }

    await client.query(
      `DELETE FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, memberUserId]
    );
  });

  res.status(204).send();
}
