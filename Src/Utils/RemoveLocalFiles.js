import fs from 'fs'

const RemoveLocalFiles = (files) =>{

    if(files?.avatar?.[0].path){
        fs.unlinkSync(files.avatar[0].path)
    }

    if(files?.coverImage?.[0].path){
        fs.unlinkSync(files.coverImage[0].path)
    }

}
  

export {RemoveLocalFiles}