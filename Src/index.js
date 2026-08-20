import dotenv from "dotenv"
import connectDB from './Db/index.js';
import {app} from './App.js'


dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`server runinig in port ${process.env.PORT}`)
    })

})
.catch((err) =>{
    console.log("mongo db connection failed ...", err);
})





























/*
import express from 'express'
const app = express()
;(async() => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI} /${DB_NAME}`)
        app.on("error", (error) =>{
            console.log("ERRR :", error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`APP is listining on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("ERROR:",error)
    }
})()
    */