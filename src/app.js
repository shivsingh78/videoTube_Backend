// Import necessary modules
import express from "express"; // Imports the Express.js framework for creating web applications.
import cors from "cors"; // Imports the CORS middleware for handling cross-origin requests.
import cookieParser from "cookie-parser"; // Imports the cookie-parser middleware for parsing cookies.

// Create an Express application instance
const app = express(); // Creates an instance of the Express application, which will be used to define routes and middleware.

// Middleware configuration:

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from specific origins
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Specifies the allowed origin(s) for cross-origin requests. process.env.CORS_ORIGIN should be defined in your environment variables.
    credentials: true, // Allows credentials (cookies, authorization headers) to be included in cross-origin requests.
  })
); // Configures CORS middleware to allow cross-origin requests with specified options.

// Parse JSON request bodies
app.use(express.json({ limit: "16kb" })); // Configures middleware to parse JSON request bodies, limiting the size to 16KB.

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Configures middleware to parse URL-encoded request bodies, allowing extended syntax and limiting the size to 16KB.

// Serve static files from the 'public' directory
app.use(express.static("public")); // Configures middleware to serve static files (e.g., images, CSS, JavaScript) from the 'public' directory.

// Parse cookies from incoming requests
app.use(cookieParser()); // Configures middleware to parse cookies from incoming requests, making them available in req.cookies.

//routes

import userRouter from "./routes/user.routes.js"; // Imports the user routes from the './routes/user.routes.js' file.

//routes declaration
app.use("/api/v1/users", userRouter); // Mounts the user routes at the '/api/v1/users' path, meaning any request starting with '/api/v1/users' will be handled by the userRouter.

// Export the Express app for use in other modules
export { app }; // Exports the Express application instance, allowing it to be used in other files (e.g., the main server file).