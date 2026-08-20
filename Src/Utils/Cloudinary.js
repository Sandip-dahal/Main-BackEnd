import {v2  as cloudinary} from 'cloudinary'     
import fs from 'fs'  //file system, helps to read, dlt  etc.. for files 


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET

})


const uploadOnCloudinary = async(localFilePath)  =>{
    try{
        if(!localFilePath) return null
        //upload file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
           resource_type: "auto" 
        })
        //file has been uplaoded suucessfuly
        console.log("file is uploaded in cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath) //remove the locally save tempr file as the upload operation get fails
        return null;

    }

}
export {uploadOnCloudinary}  