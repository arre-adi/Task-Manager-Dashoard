import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { authRouter } from "./routes/authRoutes.js";
import { projectRouter } from "./routes/projectRoutes.js";
import { taskRouter } from "./routes/taskRoutes.js";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/avatars", express.static("public/avatars"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/projects", requireAuth, projectRouter);
app.use("/tasks", requireAuth, taskRouter);

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.status ? error.message : "Internal server error";

  if (!error.status) {
    console.error(error);
  }

  res.status(status).json({ message });
});

