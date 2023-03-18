const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config();
const ejs = require("ejs");
const mongoose = require('mongoose');
var md5 = require('md5');
const helmet = require("helmet");


const app = express();
app.use(helmet());

app.use(express.static("public"));

mongoose.set("strictQuery", true);
mongoose.connect(process.env.API);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

const userSchema = {
    userName:String,
    email:String,
    password:String,
}

const User  = new mongoose.model("User",userSchema);

app.get('/',(req,res)=>{
 res.render("home");
})

app.get('/register',(req,res)=>{
    res.render("register");
   })
app.post('/register',(req,res)=>{
    const newUser =  new User({
        
        userName:req.body.userName,
        email:req.body.mail,
        password:md5(req.body.password)
    })
    newUser.save();
    res.send("your are login");
 })

 app.get('/login',(req,res)=>{
    res.render("login");
   })

   app.post("/login",function(req,res){
    const mail = req.body.email;
    const password = md5(req.body.password);

    User.findOne({email:mail})
     .then((foundUser) => {
        if(foundUser){
            if(foundUser.password === password){
                res.send("your are login");
            }else res.send('Incorrect Password');
        }
   })
   .catch((err) => {
       

console.log(err);
       res.send(400, "Bad Request");
   });
      
});

app.get('/forgot',async(req,res)=>{
    res.render("forgot");
   })
   app.post('/forgot',async(req,res)=>{
    const mail = req.body.email;
    const newPassword = md5(req.body.password);
    const doc = await User.findOneAndUpdate({emai:mail}, {password:newPassword}, {
        new: true
      });
    res.send("Your password has been changed ");
   })


app.listen(3000,()=>{
    console.log("start");
})