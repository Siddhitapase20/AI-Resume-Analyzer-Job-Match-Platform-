const express =require("express");
const cors=require("cors");
const app=express();
app.use(cors());

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload = multer({storage:storage});
app.post("/upload",upload.single("resume"),(req,res)=>{
    res.json({
        message: "file uploaded successfully",
        file:req.file
    });
});

app.listen(5000,()=>{
    console.log("server is running on port 5000");
});