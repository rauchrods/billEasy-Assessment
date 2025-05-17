import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// Import database
import {initDb} from "./models/db.js";

// Import routes
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/files.js";

// Import middleware
import errorHandler from "./middleware/errorHandler.js";

// Import queue service
// import queueService from "./services/queue.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // Logging

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply rate limiter to all routes
app.use(apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Health check route (no auth required)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database
initDb()
  .then(() => {
    console.log("Database initialized");

    // Initialize worker
    // const worker = queueService.initWorker();
    // console.log("Worker initialized");

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

export default app;
