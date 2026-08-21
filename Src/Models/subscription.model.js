import mongoose, { Schema } from "mongoose";


const subscriptionScheme =new Schema(
    {
       subscriber:{
        type:Schema.Types.ObjectId, //one who is subscribing
        ref:"User"
       },
        channel:{
            type: Schema.Types.ObjectId, //the one to whome 'subscriber ' is subscribing
            ref: "User"

        }
       
    },
    {timestamps: true})


export const Subscription = mongoose.model("Subscription",subscriptionScheme)