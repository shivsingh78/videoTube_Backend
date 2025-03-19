// require('dotenv').config({path: './.env'})

// Import necessary modules and constants
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Load environment variables from the .env file
dotenv.config({
  path: "./.env",
});

// Connect to MongoDB using the `connectDB` function
connectDB()
  .then(() => {
    // Set up an error handler to log and re-throw errors
    app.on("error", (error) => {
      console.log("ERR:", error);
      throw error;
    });

    // Start the Express server on the specified port (or default 8000)
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    // Handle errors that occur during the MongoDB connection process
    console.log("MongoDB connection failed !!! ", err);
  });

/*
import express from "express"
const app = express()

  (async()=>{
     try{
          await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
            app.on("error",(error) =>{
               console.log("ERRR: ", error);
               throw error
            })

            app.listen(process.env.PORT, () =>{
               console.log(`App is listening on port ${process.env.PORT}`);
            })
     } catch (error){
          console.error("ERROR: ", error)
          throw error
     }
})() */
