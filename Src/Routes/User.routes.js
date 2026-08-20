import { Router } from "express";
import {  registerUser, loginUser, logoutUser  } from "../Controllers/User.controller.js";
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

//Secure routes
router.route("/logoutUser").post(verifyjwt,logoutUser)





export default router;
