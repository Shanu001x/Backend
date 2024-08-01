   // Steps follow krna hi algorithm hai - sahi step

   import { asyncHandler } from "../utiles/asyncHandler.js";
   import { ApiError } from "../utiles/ApiError.js";
   import { User } from "../models/user.model.js";
   import { uploadOnCloudinary } from "../utiles/Cloudinary.js";
   import {ApiResponse} from "../utiles/ApiResponse.js"     

   const generateAccessAndRefreshToken = async(userId) => {
      try {
         const user = await User.findById(userId)
         const accessToken = user.generateAccessToken()
         const refreshToken = user.generateRefreshToken()
         user.refreshToken = refreshToken
         await user.save({ validateBeforeSave: false })

         return {accessToken, refreshToken}

      } catch (error) {
         console.error('Error in generateAccessAndRefreshToken:', error);
         throw new ApiError(500, "Something went wrong While generating refresh and access token")
      }
   }
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
   const existedUser = await User.findOne({
      $or: [{ username }, { email }],
   });

   if (existedUser) {
      throw new ApiError(409, "user with email and username already exist ");
   }

   // check for images, check for avatar

   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   console.log(req.files);


   let coverImageLocalPath;
   if (!req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
   }

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
      coverImage: coverImage?.url || "",
      email, 
      password,
      username: username.toLowerCase()
  })
   // remove password and refresh token field from response
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   // check user is created or not
   if (!createdUser) {
         throw new ApiError(400, "Something went wrong while registering the user")
   }

   // return res - ApiResponse

   return res.status(201).json(
      new ApiResponse(200, createdUser,    "User registered succesfully")
   )


   });

   const loginUser = asyncHandler(async(req, res) => {
// req body  -> Data
// username or email
// find the user
// password check
// access and refresh token
// Send Cookies
// response - Successfully

      const {email, username, password} = req.body;
      console.log(email)
      if (!username && !email) {
         throw new ApiError(400, "Username or email is required")
      }

      const user = await User.findOne({
         $or: [{username}, {email}]
      })
      
       if (!user) {
         throw new ApiError(404, "user does not exist")
       }

       const isPasswordValid = await user.isPasswordCorrect(password)

       if (!isPasswordValid) {
         throw new ApiError(401, "Invalid user credentials")
       }

       const {accessToken, refreshToken} = await generateAccessAndRefreshToken(  user._id)

       const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

       const options = {
         httpOnly: true,
         secure: true,
       }

       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
         new ApiResponse(
            200, {
               user: loggedinUser, accessToken, refreshToken
            },
            "User Logged in Succesfully" 
         )
       )
   })

   const logOutUser = asyncHandler(async(req, res) => {
      User.findByIdAndUpdate(
         req.user._id, 
         {
               $set: {
                  refreshToken: undefined
               }
               
         },
         {
            new: true
         },

      )

      const options = {
         httpOnly: true,
         secure: true,
       }

       return res.status(200)
       .clearCookie("accessToken", options)
       .clearCookie("refreshToken", options)
       .json(
         new ApiResponse(200, {}, "user logout succuessfully")
       )
   })

   export { registerUser, loginUser , logOutUser};
