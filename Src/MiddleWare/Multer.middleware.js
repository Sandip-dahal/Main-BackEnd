import multer from 'multer'


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        //console.log("Multer destination called fro :",file.originalname)
        cb(null,'./public/temp')
    },
    filename: function(req,file,cb){
        //console.log("MULTER filename called for:", file.originalname)
        cb(null,file.originalname)
    }
})


export const upload = multer({
    storage: storage
})