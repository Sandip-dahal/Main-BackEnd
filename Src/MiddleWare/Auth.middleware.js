import { User } from "../Models/user.model";
import { ApiError } from "../Utils/ApiError";
import { asyncHandler } from "../Utils/asyncHandler";
import jwt from "jsonwebtoken"


// this is logout middleware, done to get verfiy that login user is 
// the same  that requesting the logout, to do that we need the user id
// which we are unable to get in logout methods in controller,
// so this middleware provide the login user details through accesstoken
export const verifyjwt = asyncHandler( async(req, req, next) =>{
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access Token")
        }
    
        req.user = user
        next()
    } catch (error)
     {
        throw new ApiError(401, error?.message || "Invalid access token  ")
        
    }
})

export {verifyjwt}