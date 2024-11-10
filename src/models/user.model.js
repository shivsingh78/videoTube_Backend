// Import necessary modules
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// Define the User schema for storing user data in MongoDB
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate usernames
    lowercase: true, // Stores username in lowercase
    trim: true, // Removes leading/trailing whitespace
    index: true, // Creates an index for faster username searches
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate emails
    lowercase: true, // Stores email in lowercase
    trim: true, // Removes leading/trailing whitespace
  },
  fullName: {
    type: String,
    required: true,
    trim: true, // Removes leading/trailing whitespace
    index: true, // Creates an index for faster full name searches
  },
  avatar: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video", // Reference to videos in the watch history
    },
  ],
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters long"], // Enforces minimum password length
  },
  refreshToken: {
    type: String,
  },
},
{ timestamps: true }); // Automatically adds createdAt and updatedAt timestamps

// Mongoose middleware to hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it's been modified (prevents unnecessary re-hashing)
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt with a salt of 10
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// User instance method to compare entered password with hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  // Compares the provided password (plain text) with the user's hashed password
  return await bcrypt.compare(password, this.password);
};

// User instance method to generate an access token
userSchema.methods.generateAccessToken = function () {
  // Create a JWT access token containing user information
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing tokens (stored in environment variable)
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Expiry time for access tokens (stored in environment variable)
    }
  );
};

// User instance method to generate a refresh token
userSchema.methods.generateRefreshToken = function () {
  // Create a JWT refresh token containing only the user ID
  return jwt.sign(
    {
      _id: this.id, // Typo corrected here (should be this.id)
    },
    process.env.REFRESH_TOKEN_SECRET, // Secret key for signing tokens (stored in environment variable)
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Expiry time for refresh tokens (stored in environment variable)
    }
  );
};

// Export the User model as a Mongoose model
export const User = mongoose.model("User", userSchema);