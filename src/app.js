// Import necessary modules
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create an Express application instance
const app = express();

// Middleware configuration:

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from specific origins
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Specify the allowed origin(s)
  credentials: true // Allow credentials (cookies, authorization headers) to be sent with requests
}));

// Parse JSON request bodies
app.use(express.json({ limit: "16kb" })); // Limit JSON body size to 16KB

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Limit URL-encoded body size to 16KB

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Parse cookies from incoming requests
app.use(cookieParser());


//routes

import userRouter from './routes/user.routes.js'


//routes declaration
app.use("/api/v1/users",userRouter)






// Export the Express app for use in other modules
export { app };