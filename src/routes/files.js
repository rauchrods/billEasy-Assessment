import express from "express";
import {
  uploadFile,
//   getFileById,
//   getUserFiles,
} from "../controllers/fileController.js";
import { authenticate } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Upload file route
router.post("/upload", upload.single("file"), uploadFile);

// Get a specific file
// router.get("/:id", getFileById);

// Get all files for the authenticated user (with pagination)
// router.get("/", getUserFiles);

export default router;
