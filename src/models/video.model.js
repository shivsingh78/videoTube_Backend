// Import necessary modules
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the video schema for storing video data in MongoDB
const videoSchema = new Schema(
  {
    // Video file URL or path
    videoFile: {
      type: String,
      required: true,
    },
    // Thumbnail image URL or path
    thumbnail: {
      type: String,
      required: true,
    },
    // Video title
    title: {
      type: String,
      required: true,
    },
    // Video description
    description: {
      type: String,
      required: true,
    },
    // Video duration in seconds
    duration: {
      type: Number,
      required: true,
    },
    // Number of views for the video
    views: {
      type: Number,
      default: 0,
    },
    // Reference to the user who uploaded the video
    owner: {
      type: Schema.Types.ObjectId, // Reference to the User model
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

// Apply the pagination plugin to the video schema
videoSchema.plugin(mongooseAggregatePaginate);

// Create the Video model based on the schema
export const Video = mongoose.model("Video", videoSchema);