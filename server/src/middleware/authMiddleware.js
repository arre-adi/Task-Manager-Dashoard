import { verifyToken } from "../utils/auth.js";
import { pool } from "../db/pool.js";
import { unauthorized } from "../utils/http.js";
import { sanitizeUser } from "../utils/serializers.js";

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw unauthorized();
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [payload.sub]
    );

    if (!rows[0]) {
      throw unauthorized("User account no longer exists");
    }

    req.user = sanitizeUser(rows[0]);
    next();
  } catch (error) {
    next(error.status ? error : unauthorized("Invalid or expired token"));
  }
}

