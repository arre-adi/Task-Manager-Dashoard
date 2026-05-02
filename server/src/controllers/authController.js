import { pool } from "../db/pool.js";
import { comparePassword, hashPassword, signToken } from "../utils/auth.js";
import { badRequest, unauthorized } from "../utils/http.js";
import { sanitizeUser } from "../utils/serializers.js";
import { assertRequired, isEmail } from "../utils/validators.js";

export async function signup(req, res) {
  const { name, email, password } = req.body;

  assertRequired(name, "name");
  assertRequired(email, "email");
  assertRequired(password, "password");

  if (!isEmail(email)) {
    badRequest("email must be valid");
  }

  if (String(password).length < 8) {
    badRequest("password must be at least 8 characters");
  }

  const passwordHash = await hashPassword(password);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = sanitizeUser(rows[0]);
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === "23505") {
      badRequest("An account with this email already exists");
    }

    throw error;
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  assertRequired(email, "email");
  assertRequired(password, "password");

  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email.trim().toLowerCase()]
  );

  const userRow = rows[0];

  if (!userRow) {
    throw unauthorized("Invalid email or password");
  }

  const validPassword = await comparePassword(password, userRow.password_hash);

  if (!validPassword) {
    throw unauthorized("Invalid email or password");
  }

  const user = sanitizeUser(userRow);
  const token = signToken(user);

  res.json({ user, token });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

