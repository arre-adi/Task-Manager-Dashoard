import { pool } from "../db/pool.js";
import { notFound } from "../utils/http.js";

export async function getTaskWithAccessContext(taskId, client = pool) {
  const { rows } = await client.query(
    `SELECT
       t.*,
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
     WHERE t.id = $1`,
    [taskId]
  );

  if (!rows[0]) {
    throw notFound("Task not found");
  }

  return rows[0];
}

