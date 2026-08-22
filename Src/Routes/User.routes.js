import { Router } from "express";
import {  registerUser, loginUser, logoutUser, refreshAccessToken, updateUSerCoverImage, updateUserAvatar  } from "../Controllers/User.controller.js";
import {upload} from "../MiddleWare/Multer.middleware.js"
import { verifyjwt } from "../MiddleWare/Auth.middleware.js";
import { RemoveLocalFiles } from "../Utils/RemoveLocalFiles.js";
import fs from "fs"


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser,
    
)

router.route("/login").post(loginUser)
router.route("/updateavatar").post(
    verifyjwt,
    upload.single("avatar"),
    updateUserAvatar
)

//Secure routes
router.route("/logoutUser").post(verifyjwt,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)




export default router;
