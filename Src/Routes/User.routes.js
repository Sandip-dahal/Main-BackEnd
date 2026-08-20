import { Router } from "express";
import { registerUser } from "../Controllers/User.controller.js";
import {upload} from "../MiddleWare/Multer.middleware.js"
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





export default router;
