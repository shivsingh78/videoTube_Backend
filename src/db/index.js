// import necessary modules

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
 
 const connectDB = async () =>{
     try{
 // Check if the environment variable is set
          console.log(process.env.MONGODB_URI)

          
          // Connect to MongoDB
          const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
          console.log(`\n MongoDB connected sucessfully !! DB HOST :  ${connectionInstance.connection.host} `);
          // If connection fails, throw an error

     } catch (error){
          console.log("MONGODB connection Fail ", error);
          process.exit(1)
     }
 }
 // Export the function to be used in other files

 export default connectDB