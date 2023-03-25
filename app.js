const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config();
const ejs = require("ejs");
const mongoose = require('mongoose');
var md5 = require('md5');
const helmet = require("helmet");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

app.use(helmet());

app.use(express.static("public"));




mongoose.set("strictQuery", true);
mongoose.connect(process.env.API);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));



// Monogdb connection
const userSchema = new mongoose.Schema({
  userName:String,
  email:String,
  password:String
});


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
    res.send("Thank you for register");
 })

 app.get('/login',(req,res)=>{
    res.render("login");
   })

   app.post("/login", async function(req,res){
    const mail = req.body.email;
    const password = md5(req.body.password);

    User.findOne({email:mail})
     .then((foundUser) => {
        if(foundUser){
             
            if(foundUser.password === password){
                const accessToken = generateAccessToken(foundUser);
                console.log(accessToken);
                
                res.json("Access token :: " +accessToken);
                
                
            }else res.send('Incorrect Password');
        }
   })
   .catch((err) => {
       

console.log(err);
       res.send(400, "Bad Request");
   });
      
});





  //  JWT Token


  const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id}, process.env.KEY, {
      expiresIn: "900s",
    });
  };

  const verify = (req, res, next) => {
    
    if(req.body.token){
      const token = req.body.token.split(" ")[1];

  
      jwt.verify(token, process.env.KEY, (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
  
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You are not authenticated!");
    }
  };


  app.get('/forgot',verify,async(req,res)=>{
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


  //  Social Media  Post Crud Operation



 

const PostSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments:{
      type: Array,
      default: [],

    },
  }
);

const Post = new mongoose.model("Post",PostSchema)

app.post('/posts',verify,(req,res)=>{
    const newPost = new Post(req.body);
       newPost.save();
       res.status(200).json(newPost);    
});



 app.put("/posts/:id",verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userName === req.body.userName) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("You can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});



app.delete("/posts/:id",verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userName=== req.body.userName) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


app.put("/posts/:id/like",verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userName)) {
      await post.updateOne({ $push: { likes: req.body.userName } });
      res.status(200).json("The post has been liked by " +req.body.userName);
    } else {
      await post.updateOne({ $pull: { likes: req.body.userName } });
      res.status(200).json("The post has been disliked by  "+req.body.userName);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


app.put("/posts/:id/comment", verify,async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
  
      await post.updateOne({ $push: { comments: req.body.comment } });
      res.status(200).json("Someone comment on your Post");
    
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/posts/:id",verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});




app.listen(3000,()=>{
    console.log("start");
})