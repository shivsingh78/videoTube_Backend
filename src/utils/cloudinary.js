// Import necessary modules
import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Asynchronous function to upload a file to Cloudinary
const uploadCloudinary = async (localFilePath) => {
  try {
    // Check if the local file path is valid
    if (!localFilePath) {
      return null; // Return null if the file path is empty
    }

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Automatically detect the file type
    });
   

    // Log success message and return the upload result
    console.log('File uploaded to Cloudinary:', response.url);
    return response;
   
    

  } catch (error) {
    // Handle upload errors
    console.error('Error uploading file to Cloudinary:', error);

    // Remove the temporary local file if the upload failed
    fs.unlinkSync(localFilePath);

    // Return null to indicate a failed upload
    return null;
  }
};

// Export the uploadCloudinary function
export { uploadCloudinary };