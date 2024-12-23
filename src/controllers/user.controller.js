import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefereshToken = async(userId) =>{
  try{

    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken
    const refreshToken = user.generateRefreshToken

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false })

    return {accessToken, refreshToken}

  } catch{
     throw new ApiError(500, "Something went wrong while generating referesh and access token ")
  }
}
const registerUser = asynHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body; 

  // Validate required fields
  
  if (!fullName || !email || !username || !password) { 
    throw new ApiError(400, "All fields are required");
}

   if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


     // Assuming user data is in the request body

     const user = req.body;
    if (user) {
      console.log('User object:', user); // Log the user object to see its contents
      // ... further processing of user data
    } else {
      throw new ApiError(400, "Missing user data in request body");
    } 


  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  console.log(req.files);
    
  // Handle file uploads
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }  


  if (!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }


  let avatarUrl, coverImageUrl;

  try {
    if (avatarLocalPath) {
      const avatarResult = await uploadOnCloudinary(avatarLocalPath);
      avatarUrl = avatarResult.url;
    } else {
      avatarUrl = "";
    }

    if (coverImageLocalPath) {
      const coverImageResult = await uploadOnCloudinary(coverImageLocalPath);
      coverImageUrl = coverImageResult.url;
    } else {
      coverImageUrl = ''
    }
  } catch (error) {
    console.error("Error uploading files to the Cloudinary shiv:", error);
    throw new ApiError(500, "Error uploading files to Cloudinary");
  }
  

  // Create the user
  try {
    const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatarUrl || "",
      coverImage: coverImageUrl || ""
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

    return res.status(201).json(new ApiResponse(200, user, "User registered successfully"));
  } catch (error) {
    console.error("Error creating user:", error);
    throw new ApiError(500, "Error creating user");
  }
});

const loginUser =asynHandler(async(req,res) =>{
// req.body => data
// login with username or email 
// find username in database
// password check 
// access and refresh token 
// send cookie

const {username,email, password} =req.body;
   
if (!username || ! email) {
  throw new ApiError(400," username or email is required"
  )
} 

 const user = await User.findOne({
  $or: [{username},{email}]
})
 
if(!user){
  throw new ApiError(404, " User does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if (!isPasswordValid){
  throw new ApiError(401, "Invalid user credentials")
}


})




export { 
  registerUser,
  loginUser,
  
 };