import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Import routes
import exampleRoutes from "./routes/example";
import indexRoutes from "./routes/index.routes";

// Import middlewares
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./middlewares/logger";


const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Request logging middleware
app.use(logger);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// API routes
app.use("/api/example", exampleRoutes);

app.use("/api/v1", indexRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

export default app;
