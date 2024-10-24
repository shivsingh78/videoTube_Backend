// Import necessary modules
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Asynchronous function to connect to MongoDB database
const connectDB = async () => {
  try {
    // Check if the MONGODB_URI environment variable is set
    console.log(`Checking for MONGODB_URI environment variable...`);
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set!");
    }

    // Connect to MongoDB using the provided URI and database name
    console.log(`Connecting to MongoDB using: ${process.env.MONGODB_URI}/${DB_NAME}`);
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    // Log success message upon successful connection
    console.log(`\n MongoDB connected successfully !! DB HOST:  ${connectionInstance.connection.host} `);
  } catch (error) {
    // Handle connection errors
    console.error("MONGODB connection failed! ", error);
    process.exit(1); // Exit the process with an error code
  }
};

// Export the connectDB function to be used in other files
export default connectDB;