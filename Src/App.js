import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use((err,req,res,next) =>{
    if(err.name ==="ValidationError"){
        return res.status(400).json({
            success:false,
            message: err.message,
        })
    }
    return res.status(err.statusCode || 500).json({
        success:false,
        message:err.message
    })
})


//Routes import
import userRouter from './Routes/User.routes.js'


//routes declaration
app.use("/api/v1/users", userRouter)


export {app} 
