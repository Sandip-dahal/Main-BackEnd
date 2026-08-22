import {asyncHandler} from "../Utils/asyncHandler.js"
import {ApiError} from "../Utils/ApiError.js"
import { User } from "../Models/user.model.js"
import {uploadOnCloudinary} from "../Utils/Cloudinary.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import { RemoveLocalFiles } from "../Utils/RemoveLocalFiles.js"
import fs, { access } from "fs"
import jwt from "jsonwebtoken"
import { trusted } from "mongoose"

const generateAccessAndRefreshTokens = async(userId)=> {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return { accessToken, refreshToken}
    }
    catch{
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}


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
        RemoveLocalFiles(req.files)
        throw new ApiError(400, "all fields are required")
    }



    //Is there already user exist with this username or mail
    const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    })
    if(existedUser){
        RemoveLocalFiles(req.files)
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


const loginUser = asyncHandler( async(req,res) =>{
// req body -> data brings
//username or email
//find the user
// password check 
//access token or refresh token generate 
//send tokens through cookies
//sent response to user



const {username, email, password} = req.body

if(!(username || email)) {
    throw new ApiError(400, "username or email is required")
}

const user = await User.findOne({
    $or:[{username}, {email}]
})

if(!user){
    throw new ApiError(404, "User doesnt exists")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials ")
}

//calling the fuction to generate access and refresh token...
const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
//Prepare data that should not send to user(means here frontend)... ie, password and refreshtoken
const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


// seting up cookeies 
const options = {
    httpOnly: true,
    secure: true
}
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponse(
        200,
        {
            user:loggedInUser, accessToken,refreshToken
        },
        "User logged in sucessfully"
    )
)

})

const logoutUser = asyncHandler( async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set:{
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout"))
})


const refreshAccessToken = asyncHandler(async(req,res) =>{
    //this req.body is done if someone is using mobile phone for mobile phone it accesss through req.body 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh Token") 
        }
    
        //matching token ...
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is Ivalid or Used")
        }
    
        const {newAccessToken,newRefreshToken} = await  generateAccessAndRefreshTokens(user._id)
    
        const options={
            httpOnly:true,
            secure:true,
        }
    
        return res
        .status(200)
        .cookie("accessToken",newAccessToken,options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                "Access token Refreshed"
    
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message ||"Invalid request ")
        
    }
})


const changeCurrentPasssword = asyncHandler( async (req,res) =>{
    const {oldPassword, newPassword} = req.body
    
    const user = await User.findById(req.user._id)
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old Password")
    }
    
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json( new ApiResponse(200,"password change successfully"))



})

const getCurrentUser = asyncHandler( async(req,res) =>{
    return res
    .status(200)
    .json(200,req.user,"current user Fetched successfully ")
})


const updateAccountDEtails = asyncHandler (async (req,res) =>{
    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "all field is required")
    }
    
    const user = User.findByIdAndUpdate( 
        req.user?._id,
        { $set:{
            fullName:fullName,
            email: email
        } },
        {new: true}// this line will return info only after update
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details update sucessfully"))
})

const updateUserAvatar = asyncHandler( async(req,res) =>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing ")

    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {$set:{
            avatar:avatar.url
        }},
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json( new ApiResponse(200, user,"Avatar is Upadated SuccessFully"))
})


const updateUSerCoverImage = asyncHandler( async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverimage file is missing")

    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage){
        throw new ApiError(400, "Error while uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set:{
            coverImage:coverImage.url
        } },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json( new ApiResponse(200,user,"coverImage updated Sucessfully"))

})


export {
    registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
    changeCurrentPasssword,
    getCurrentUser,
    updateAccountDEtails,
    updateUserAvatar,
    updateUSerCoverImage,
    }