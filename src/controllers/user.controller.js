// Steps follow krna hi algorithm hai - sahi step

import { asyncHandler } from "../utiles/asyncHandler.js";
import {ApiError} from "../utiles/ApiError.js"

const registerUser = asyncHandler(async(req, res) => {
   // get user details from frontend
   // validation not empty
   // Check if user already exist: email, username
   // check for images, check for avatar
   // upload them to cloudinary - avatar
   // create user object - create entry in DB
   // remove password and refresh token field from response
   // return res


   const {fullname, username, email, password} = req.body
   console.log("email: ", email);

   if (
      [fullname, email, password, username].some((field) => field?.trim() === "")
   ) {
      throw new ApiError(400, "fullName is required") 
   }
})

export {registerUser};