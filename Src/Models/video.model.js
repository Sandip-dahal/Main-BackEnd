import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoScheme = new Schema(
    {
        videofile:{
            type:String, //cloudanary url
            required: true,
        },
        thumbnail:{
            type:String, //cloudanary url
            required: true,
        },
        title:{
            type:String,
            required: true,
        },
        description:{
            type:String,
            required: true,
        },
        duration:{
            type:Number,  //cloudnary 
            required: true
        },
        views:{
            type:Number,
            default:0,

        },
        isPublished:{
            type: Boolean,
            default: true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }



    },{timestamps: true}
)


videoScheme.plugin(mongooseAggregatePaginate)



export const Video = mongoose.model("Video", videoScheme)