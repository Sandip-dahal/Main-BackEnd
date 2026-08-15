import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');



import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js"



const connectDB = async () =>{
    try{
        //console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n mongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("mongodb connection error", error);
        process.exit(1)
    }
}

export default connectDB