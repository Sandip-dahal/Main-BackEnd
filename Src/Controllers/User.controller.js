import {asyncHandler} from "../Utils/asyncHandler.js"
import {ApiError} from "../Utils/ApiError.js"
import { User } from "../Models/user.model.js"
import {uploadOnCloudinary} from "../Utils/Cloudinary.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import { RemoveLocalFiles } from "../Utils/RemoveLocalFiles.js"

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


const loginUser = asyncHandler( async(req,res) =>{
// req body -> data brings
//username or email
//find the user
// password check 
//access token or refresh token generate 
//send tokens through cookies
//sent response to user


const {username, email, password} = req.body
if(!username || !email) {
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
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logout"))
})

export {registerUser, loginUser,logoutUser}