const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config();
const ejs = require("ejs");
const mongoose = require('mongoose');
var md5 = require('md5');
const helmet = require("helmet");


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





// Monogdb cnnection
const userSchema = new mongoose.Schema({
  userName:String,
  email:String,
  password:String
});



const User  = new mongoose.model("User",userSchema);

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

app.post('/posts',(req,res)=>{
  

    const newPost = new Post(req.body);
       newPost.save();
       res.status(200).json(newPost);    
});
 app.put("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userName === req.body.userName) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


app.delete("/posts/:id", async (req, res) => {
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

app.put("/posts/:id/like", async (req, res) => {
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

app.put("/posts/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
  
      await post.updateOne({ $push: { comments: req.body.comment } });
      res.status(200).json("Someone comment on your Post");
    
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/posts/:id", async (req, res) => {
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