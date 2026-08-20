import {asyncHandler} from "../Utils/asyncHandler.js"
import {ApiError} from "../Utils/ApiError.js"
import { User } from "../Models/user.model.js"
import {uploadOnCloudinary} from "../Utils/Cloudinary.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import { RemoveLocalFiles } from "../Utils/RemoveLocalFiles.js"



const registerUser = asyncHandler( async(req, res)=>{
    //get user data 
    //validation -not empty
    //check if user already exist: check using username,email,
    //check for image , check for avatar,
    //upload them to cloudinary
    //create user object - create entry in db
    //remove passsword and refresh token field from response
    //check for user creation 
    //return response
    
    //get user data
    const { fullName, email, username, password} = req.body
    //console.log("email", email)


    // check every filed for empty...
    if(
        [fullName, email,username,password].some((field) =>
            !field?.trim() 
        )
    ){
        //RemoveLocalFiles(req.files)
        throw new ApiError(400, "all fields are required")
    }



    //Is there already user exist with this username or mail
    const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    })
    if(existedUser){
        //RemoveLocalFiles(req.files)
        throw new ApiError(409, "User with email or username already exists")
    }




//local path of avatar .......
    //console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    // upload avatara and coverimage to cludinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(404, "avatar file is required")
    }
  

    //entrying data to db 
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"" ,
        email,
        password,
        username: username.toLowerCase()

    })


    // preparing reposne to user when user is created, expect password and refreshtoken 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    //check for user creation 
    if(!createdUser){
        throw new ApiError(500, "Something went Wrong while registring the user")
    }

    //providing propre response to user now 
    return res.status(201).json(
        new ApiResponse(200,createdUser, "User register succesfullly ")
    )




} )

export {registerUser}