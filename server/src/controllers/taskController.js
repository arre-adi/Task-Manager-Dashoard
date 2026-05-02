import { pool } from "../db/pool.js";
import {
  ensureAssignableMember,
  ensureProjectMember
} from "../services/projectAccessService.js";
import { getTaskWithAccessContext } from "../services/taskService.js";
import { badRequest, forbidden, notFound } from "../utils/http.js";
import { serializeTask } from "../utils/serializers.js";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  assertDateString,
  assertEnum,
  assertPositiveInteger,
  assertRequired
} from "../utils/validators.js";

const taskSelectCore = `
  SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.created_at,
    t.updated_at,
    t.project_id,
    p.name AS project_name,
    creator.id AS created_by_id,
    creator.name AS created_by_name,
    creator.email AS created_by_email,
    assignee.id AS assigned_to_id,
    assignee.name AS assigned_to_name,
    assignee.email AS assigned_to_email
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  JOIN users creator ON creator.id = t.created_by
  JOIN users assignee ON assignee.id = t.assigned_to
`;

export async function getTasks(req, res) {
  const { projectId } = req.query;

  if (projectId) {
    const resolvedProjectId = assertPositiveInteger(projectId, "project id");
    await ensureProjectMember(req.user.id, resolvedProjectId);

    const { rows } = await pool.query(
      `${taskSelectCore}
       WHERE t.project_id = $1
       ORDER BY t.due_date ASC, t.created_at DESC`,
      [resolvedProjectId]
    );

    return res.json({ tasks: rows.map(serializeTask) });
  }

  const { rows } = await pool.query(
    `${taskSelectCore}
     JOIN project_members pm
       ON pm.project_id = t.project_id
      AND pm.user_id = $1
     ORDER BY t.due_date ASC, t.created_at DESC`,
    [req.user.id]
  );

  return res.json({ tasks: rows.map(serializeTask) });
}

export async function createTask(req, res) {
  const { title, description, status, priority, dueDate, assignedTo, projectId } = req.body;

  assertRequired(title, "title");
  assertRequired(dueDate, "dueDate");
  assertRequired(assignedTo, "assignedTo");
  assertRequired(projectId, "projectId");

  const resolvedProjectId = assertPositiveInteger(projectId, "projectId");
  const resolvedAssignedTo = assertPositiveInteger(assignedTo, "assignedTo");
  assertDateString(dueDate, "dueDate");

  if (status) {
    assertEnum(status, TASK_STATUSES, "status");
  }

  if (priority) {
    assertEnum(priority, TASK_PRIORITIES, "priority");
  }

  const membership = await ensureProjectMember(req.user.id, resolvedProjectId);
  await ensureAssignableMember(resolvedProjectId, resolvedAssignedTo);

  if (membership.role !== "ADMIN" && resolvedAssignedTo !== req.user.id) {
    throw forbidden("Members may only assign new tasks to themselves");
  }

  const { rows } = await pool.query(
    `INSERT INTO tasks (
       title,
       description,
       status,
       priority,
       due_date,
       created_by,
       assigned_to,
       project_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      title.trim(),
      description?.trim() || null,
      status || "TODO",
      priority || "MEDIUM",
      dueDate,
      req.user.id,
      resolvedAssignedTo,
      resolvedProjectId
    ]
  );

  const createdTask = await getTaskWithAccessContext(rows[0].id);
  res.status(201).json({ task: serializeTask(createdTask) });
}

export async function updateTask(req, res) {
  const taskId = assertPositiveInteger(req.params.id, "task id");
  const task = await getTaskWithAccessContext(taskId);
  const membership = await ensureProjectMember(req.user.id, task.project_id);
  const isAdmin = membership.role === "ADMIN";
  const isCreator = Number(task.created_by) === req.user.id;
  const isAssignee = Number(task.assigned_to) === req.user.id;
  const body = req.body;

  if (!isAdmin && !isCreator && !isAssignee) {
    throw forbidden("You can only edit tasks you created or are assigned to");
  }

  if (Object.keys(body).length === 0) {
    badRequest("At least one field is required for update");
  }

  const updates = [];
  const values = [];

  function pushUpdate(column, value) {
    values.push(value);
    updates.push(`${column} = $${values.length}`);
  }

  if (body.title !== undefined) {
    if (!isAdmin && !isCreator && !isAssignee) {
      throw forbidden("You cannot change the title of this task");
    }

    assertRequired(body.title, "title");
    pushUpdate("title", String(body.title).trim());
  }

  if (body.description !== undefined) {
    pushUpdate("description", body.description ? String(body.description).trim() : null);
  }

  if (body.priority !== undefined) {
    assertEnum(body.priority, TASK_PRIORITIES, "priority");
    pushUpdate("priority", body.priority);
  }

  if (body.dueDate !== undefined) {
    assertDateString(body.dueDate, "dueDate");
    pushUpdate("due_date", body.dueDate);
  }

  if (body.assignedTo !== undefined) {
    const nextAssignee = assertPositiveInteger(body.assignedTo, "assignedTo");

    if (nextAssignee !== Number(task.assigned_to)) {
      if (!isAdmin) {
        throw forbidden("Only admins can reassign tasks");
      }

      await ensureAssignableMember(task.project_id, nextAssignee);
      pushUpdate("assigned_to", nextAssignee);
    }
  }

  if (body.status !== undefined) {
    assertEnum(body.status, TASK_STATUSES, "status");

    if (body.status !== task.status) {
      if (!isAdmin && !isAssignee) {
        throw forbidden("Only the assignee or an admin can change task status");
      }

      pushUpdate("status", body.status);
    }
  }

  if (!updates.length) {
    badRequest("No valid fields were provided for update");
  }

  values.push(taskId);
  const updateQuery = `
    UPDATE tasks
    SET ${updates.join(", ")}
    WHERE id = $${values.length}
    RETURNING id
  `;

  const { rows } = await pool.query(updateQuery, values);
  const updatedTask = await getTaskWithAccessContext(rows[0].id);

  res.json({ task: serializeTask(updatedTask) });
}

export async function deleteTask(req, res) {
  const taskId = assertPositiveInteger(req.params.id, "task id");
  const task = await getTaskWithAccessContext(taskId);
  const membership = await ensureProjectMember(req.user.id, task.project_id);
  const isAdmin = membership.role === "ADMIN";
  const isCreator = Number(task.created_by) === req.user.id;

  if (!isAdmin && !isCreator) {
    throw forbidden("You can only delete tasks you created");
  }

  await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);
  res.status(204).send();
}
