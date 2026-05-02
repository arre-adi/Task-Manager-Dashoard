import { Router } from "express";
import { login, me, signup } from "../controllers/authController.js";
import { asyncHandler } from "../utils/http.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const authRouter = Router();

authRouter.post("/signup", asyncHandler(signup));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", requireAuth, asyncHandler(me));

