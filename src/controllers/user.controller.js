// Steps follow krna hi algorithm hai - sahi step

import { asyncHandler } from "../utiles/asyncHandler.js";
import { ApiError } from "../utiles/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utiles/Cloudinary.js";
import {ApiResponse} from "../utiles/ApiResponse.js"


const registerUser = asyncHandler(async (req, res) => {
  /*
   Checking has to be done ----
      1. get user details from frontend
      2. validation not empty
      3. Check if user already exist: email, username
      4. check for images, check for avatar
      5. upload them to cloudinary - avatar
      6. create user object - create entry in DB
      7. remove password and refresh token field from response
      8. return res */

  //get user details from frontend
  const { fullname, username, email, password } = req.body;
  console.log("email: ", email);

  //validation not empty
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "fullName is required");
  }

  // check if user already exist
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email and username already exist ");
  }

  // check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(req.files);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary - avatar
  // uploading img is a time consuming process

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Create an object and make entry in DB
   const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    username: username.toLowerCase(),
  });
// remove password and refresh token field from response
  const createdUser = User.findById(user._id).select(
   "-password -refreshToken"
  )
 // check user is created or not
  if (!createdUser) {
      throw new ApiError(400, "Something went wrong while registering the user")
  }

  // return res - ApiResponse

  return res.status(201).json(
   new ApiResponse(200, createdUser, "User registered succesfully")
  )


});

export { registerUser };
