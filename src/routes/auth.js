import express from "express";
import { login, register, logout } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Login route
router.post("/login", login);

// Register route (optional)
router.post("/register", register);

// Logout route (requires authentication)
router.post("/logout", authenticate, logout);

export default router;
