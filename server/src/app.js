import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (env.nodeEnv === "production") {
  const clientDistPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDistPath));
  
  app.get("*", (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith("/auth") && !req.path.startsWith("/projects") && !req.path.startsWith("/tasks") && !req.path.startsWith("/avatars")) {
      res.sendFile(path.join(clientDistPath, "index.html"));
    }
  });
}

