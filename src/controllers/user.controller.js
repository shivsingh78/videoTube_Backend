import { asyncHandler } from "../utils/asyncHandler.js"; // Imports the asyncHandler utility for handling asynchronous operations.
import { ApiError } from "../utils/ApiError.js"; // Imports the ApiError class for custom error handling.
import { User } from "../models/user.model.js"; // Imports the User model for database interactions.
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Imports the uploadOnCloudinary utility for uploading files to Cloudinary.
import { ApiResponse } from "../utils/ApiResponse.js"; // Imports the ApiResponse class for standardized API responses.
import jwt from "jsonwebtoken"; // Imports the jsonwebtoken library for handling JWT tokens.

const generateAccessTokenAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId); // Finds a user by their ID.
    const accessToken = user.generateAccessToken(); // Generates an access token for the user.
    const refreshToken = user.generateRefreshToken(); // Generates a refresh token for the user.

    user.refreshToken = refreshToken; // Updates the user's refresh token.
    await user.save({ validateBeforeSave: false }); // Saves the user with the new refresh token.

    return { accessToken, refreshToken }; // Returns the generated tokens.
  } catch {
    throw new ApiError(500, "Something went wrong while generating referesh and access token "); // Throws an error if token generation fails.
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body; // Extracts user details from the request body.

  // Validate required fields

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required"); // Throws an error if any required field is missing.
  }

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required"); // Throws an error if any required field is empty.
  }

  // Assuming user data is in the request body

  const user = req.body; // Assigns the request body to the 'user' variable.
  if (user) {
    console.log("User object:", user); // Log the user object to see its contents
    // ... further processing of user data
  } else {
    throw new ApiError(400, "Missing user data in request body"); // Throws an error if user data is missing.
  }
  console.log(user);

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ username }, { email }], // Queries the database for existing users with the same username or email.
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists"); // Throws an error if a user with the same username or email already exists.
  }

  console.log(req.files); // Logs the uploaded files.

  // Handle file uploads
  const avatarLocalPath = req.files?.avatar[0]?.path; // Extracts the path of the uploaded avatar file.
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path; // Extracts the path of the uploaded cover image file.
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required"); // Throws an error if the avatar file is missing.
  }

  let avatarUrl, coverImageUrl;

  try {
    if (avatarLocalPath) {
      const avatarResult = await uploadOnCloudinary(avatarLocalPath); // Uploads the avatar file to Cloudinary.
      avatarUrl = avatarResult.url; // Extracts the URL of the uploaded avatar.
    } else {
      avatarUrl = ""; // Sets the avatar URL to an empty string if no avatar file is uploaded.
    }

    if (coverImageLocalPath) {
      const coverImageResult = await uploadOnCloudinary(coverImageLocalPath); // Uploads the cover image file to Cloudinary.
      coverImageUrl = coverImageResult.url; // Extracts the URL of the uploaded cover image.
    } else {
      coverImageUrl = ""; // Sets the cover image URL to an empty string if no cover image file is uploaded.
    }
  } catch (error) {
    console.error("Error uploading files to the Cloudinary shiv:", error); // Logs an error if file upload to Cloudinary fails.
    throw new ApiError(500, "Error uploading files to Cloudinary"); // Throws an error if file upload to Cloudinary fails.
  }

  // Create the user
  try {
    const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatarUrl || "",
      coverImage: coverImageUrl || "", // Creates a new user in the database.
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken"); // Finds the newly created user and excludes password and refresh token.

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user"); // Throws an error if user creation fails.
    }

    return res.status(201).json(new ApiResponse(200, user, "User registered successfully")); // Returns a success response with the registered user data.
  } catch (error) {
    console.error("Error creating user:", error); // Logs an error if user creation fails.
    throw new ApiError(500, "Error creating user"); // Throws an error if user creation fails.
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body => data
  // login with username or email
  // find username in database
  // password check
  // access and refresh token
  // send cookie

  const { username, email, password } = req.body; // Extracts username, email, and password from the request body.
  console.log(req.body); // Logs the request body.

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required"); // Throws an error if neither username nor email is provided.
  }

  const user = await User.findOne({
    $or: [{ username }, { email }], // Queries the database for a user with the provided username or email.
  });

  if (!user) {
    throw new ApiError(404, " User does not exist"); // Throws an error if the user is not found.
  }

  const isPasswordValid = await user.isPasswordCorrect(password); // Checks if the provided password is correct.

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials"); // Throws an error if the password is incorrect.
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefereshToken(user._id); // Generates access and refresh tokens for the user.

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // Finds the logged-in user and excludes password and refresh token.

  const options = {
    httpOnly: true,
    secure: true, // Sets cookie options for security.
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken, // Returns a success response with the logged-in user data and tokens.
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined, // Updates the user's refresh token to undefined.
      },
    },
    {
      new: true, // Returns the modified document.
    }
  );

  const options = {
    httpOnly: true,
    secure: true, // Sets cookie options for security.
  };
  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .clearCookie("accessToken", options) // Clears the "accessToken" cookie.
    .clearCookie("refreshToken", options) // Clears the "refreshToken" cookie.
    .json(new ApiResponse(200, {}, " User logged Out ")); // Sends a JSON response with a success message.
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  incomingRefreshToken; // This line does nothing, it just declares the variable.

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request"); // Throws an error if the refresh token is missing.
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token"); // Throws an error if the user is not found.
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used"); // Throws an error if the refresh token does not match.
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefereshToken(user._id);

    return res
      .status(200) // Sets the HTTP status code to 200 (OK).
      .cookie("accessToken", accessToken, options) // Sets the "accessToken" cookie.
      .cookie("refreshToken", newRefreshToken, options) // Sets the "refreshToken" cookie.
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          " Access token refreshed"
        )
      ); // Sends a JSON response with the new access and refresh tokens.
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token"); // Throws an error if the refresh token is invalid.
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password "); // Throws an error if the old password is incorrect.
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .json(new ApiResponse(200, {}, "Password changed successfully")); // Sends a JSON response with a success message.
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .json(
      new ApiResponse(200, req, req.user, "current user fetched successfully")
    ); // Sends a JSON response with the current user's data.
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required"); // Throws an error if fullName or email are missing.
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password"); // Updates the user's account details and excludes the password from the result.

  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .json(new ApiResponse(200, user, "Account details updated successfully")); // Sends a JSON response with the updated user data.
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing"); // Throws an error if the avatar file is missing.
  }

  //TODO: delete old image -assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar"); // Throws an error if the upload to Cloudinary fails.
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password"); // Updates the user's avatar and excludes the password from the result.

  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .json(new ApiResponse(200, user, "avatar image updated successfully")); // Sends a JSON response with the updated user data.
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing"); // Throws an error if the cover image file is missing.
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coverImage"); // Throws an error if the upload to Cloudinary fails.
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password"); // Updates the user's cover image and excludes the password from the result.

  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .json(new ApiResponse(200, user, "Cover image updated successfully")); // Sends a JSON response with the updated user data.
});


const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; // Extracts the username from the request parameters.
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing"); // Throws an error if the username is missing or empty.
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase }, // Matches users with the provided username (case-insensitive).
    },
    {
      $lookup: {
        from: "subscriptions", // Joins with the "subscriptions" collection.
        localField: "_id", // Matches the "_id" field in the "User" collection.
        foreignField: "channel", // Matches the "channel" field in the "subscriptions" collection.
        as: "subscribers", // Stores the results in the "subscribers" array.
      },
    },
    {
      $lookup: {
        from: "subscriptions", // Joins with the "subscriptions" collection again.
        localField: "_id", // Matches the "_id" field in the "User" collection.
        foreignField: "subscriber", // Matches the "subscriber" field in the "subscriptions" collection.
        as: "subscribedTo", // Stores the results in the "subscribedTo" array.
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers", // Calculates the size of the "subscribers" array.
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo", // Calculates the size of the "subscribedTo" array.
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // Checks if the current user is a subscriber.
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1, // Includes the "fullName" field.
        subscriberCount: 1, // Includes the "subscriberCount" field.
        channelSubscribedToCount: 1, // Includes the "channelSubscribedToCount" field.
        isSubscribed: 1, // Includes the "isSubscribed" field.
        avatar: 1, // Includes the "avatar" field.
        coverImage: 1, // Includes the "coverImage" field.
        email: 1, // Includes the "email" field.
      },
    },
  ]);
  console.log(channel); // Logs the aggregated channel data to the console.
  if (!channel?.length) {
    throw new ApiError(400, " channel does not exist"); // Throws an error if the channel does not exist.
  }
  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .json(new ApiResponse(200, channel[0], "user channel fetched successfully")); // Sends a JSON response with the channel data and a success message.
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.objectId(req.user._id), // Matches the user by their ID.
      },
    },
    {
      $lookup: {
        from: "videos", // Joins with the "videos" collection.
        localField: "watchHistory", // Matches the "watchHistory" field in the "User" collection.
        foreignField: "_id", // Matches the "_id" field in the "videos" collection.
        as: "watchHistory", // Stores the results in the "watchHistory" array.
        pipeline: [
          {
            $lookup: {
              from: "users", // Joins with the "users" collection.
              localField: "owner", // Matches the "owner" field in the "videos" collection.
              foreignField: "_id", // Matches the "_id" field in the "users" collection.
              as: "owner", // Stores the results in the "owner" array.
              pipeline: [
                {
                  $project: {
                    fullName: 1, // Includes the "fullName" field.
                    username: 1, // Includes the "username" field.
                    avatar: 1, // Includes the "avatar" field.
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner", // Gets the first element of the "owner" array.
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200) // Sets the HTTP status code to 200 (OK).
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory, // Sends the watch history data.
        "Watch history fetched successfully" // Sends a success message.
      )
    ); // Sends a JSON response with the watch history data and a success message.
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
