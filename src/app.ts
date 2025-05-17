// Third-party module imports
import "express-async-errors"; // Import this first to handle async errors globally
import express from "express";
import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";

// Local module imports
import { errorHandler } from "./middlewares";
import { authRoutes, employeeRoutes } from "./routes";
import { defineAssociations } from "./models";

// Initialize Express app
const app = express();

// Define associations between models
defineAssociations();

/**
 * --------------------------
 * Middleware Configuration
 * --------------------------
 */

// Security Middlewares
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Parsing Middlewares
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

// Rate Limiting Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Only apply rate limiter in production
if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}

// Initialize Passport.js for authentication
app.use(passport.initialize());

/**
 * --------------------------
 * Routes
 * --------------------------
 */

// Basic route for root path
app.get("/", (_req, res) => {
  res.sendFile("index.html", {
    root: `${__dirname}/public`,
  });
});

// Authentication routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/employees", employeeRoutes);

// Text-related routes with authentication middleware
// app.use("/api/v1/subordinates", isAuth);

/**
 * --------------------------
 * Global Error Handler
 * --------------------------
 */
app.use(errorHandler);

export default app;
