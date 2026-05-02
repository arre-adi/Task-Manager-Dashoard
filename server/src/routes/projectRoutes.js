import { Router } from "express";
import {
  addMember,
  createProject,
  deleteProject,
  getProjects,
  removeMember
} from "../controllers/projectController.js";
import { asyncHandler } from "../utils/http.js";

export const projectRouter = Router();

projectRouter.get("/", asyncHandler(getProjects));
projectRouter.post("/", asyncHandler(createProject));
projectRouter.delete("/:id", asyncHandler(deleteProject));
projectRouter.post("/:id/members", asyncHandler(addMember));
projectRouter.delete("/:id/members/:userId", asyncHandler(removeMember));

