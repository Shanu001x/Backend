import { User } from "../models/user.model.js";
import { ApiError } from "../utiles/ApiError.js";
import { asyncHandler } from "../utiles/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            throw new ApiError( 401, "unauthorised Access")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            // Next_video: Todo Discuss About frontend 
            throw new ApiError(401, "inavalid access token")
        }   
        req.user =  user;
        next()
    } catch (error) {
        throw new ApiError( 401, error?.message || "invalid access token")
    }
})