import express from "express"; 
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName: "new",
}).then(()=>console.log("database connected"))
.catch((e)=>console.log(e));


const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

const User=mongoose.model("user",userSchema);


const app=express();

app.use(express.urlencoded({ extended:true}));
app.use(cookieParser());

app.set("view engine","ejs");

const isA=async(req,res,next)=>{
    const { token }=req.cookies;
    if(token){
         const decoded=jwt.verify(token,"abcdefgh");
         req.user=await User.findById(decoded._id);   

         next();
      }else{
          res.redirect("/login");
      }

}
 

app.get("/",isA,(req,res)=>{
  res.render("logout")
});

app.get("/login",(req,res)=>{
  res.render("login")
})

app.get("/register",(req,res)=>{
 
    res.render("register");
});

app.post("/login",async(req,res)=>{

    const {email,password}=req.body;

   let user=await User.findOne({email})
   
   if(!user) return res.redirect("/register")

   const ismatch=user.password===password;
   if(!ismatch) return res.render("login",{message:"Incorrect Password"});

   const token = jwt.sign({_id:user._id},"abcdefgh")

   res.cookie("token",token,{
   httpOnly:true,
   });
   res.redirect("/");

})


app.post("/register",async(req,res)=>{
    const {name,email,password}=req.body;

    let user=await User.findOne({email});
    if(user){
     return res.redirect("/login");
    }

   
    user =await User.create({
     name,
     email,
     password,
   });

   const token = jwt.sign({_id:user._id},"abcdefgh")

   res.cookie("token",token,{
   httpOnly:true,
   });
   res.redirect("/");
})

app.get("/logout",(req,res)=>{
    res.cookie("token","null",{
      
        expires:new Date(Date.now())
    });
    res.redirect("/");
 })


app.listen(5000,()=>{
    console.log("start");
})