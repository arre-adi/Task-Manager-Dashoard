import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import { asyncHandler } from "../utils/http.js";

export const taskRouter = Router();

taskRouter.get("/", asyncHandler(getTasks));
taskRouter.post("/", asyncHandler(createTask));
taskRouter.put("/:id", asyncHandler(updateTask));
taskRouter.delete("/:id", asyncHandler(deleteTask));

