require('dotenv').config();
const express = require("express");
const path = require("path");
const userModel = require("./models/user");
const postModel = require("./models/post");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")
const app = express();
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.use(
    session({
      secret: process.env.SESSION_SECRET, // This is the required secret
      resave: false, // Prevents resaving session if nothing has changed
      saveUninitialized: false, // Avoids saving empty sessions
      cookie: { secure: false }, // Use `true` if HTTPS is enabled
    })
);



app.get("/", (req, res)=>{
    res.render("index");
})



app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile');
    }
);


app.get("/login",(req, res)=>{
    res.render("login");
})

app.get("/logout",(req, res)=>{
    res.cookie("token", "")
    res.redirect("/login");
})

app.get("/register",(req, res)=>{
    res.render("index");
})

app.get("/profile", isLoggedIn, async (req, res)=>{
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    res.render("profile", {user});
})

app.get("/profile/edit/:id", isLoggedIn, async (req, res)=>{
    let post = await postModel.findOne({_id: req.params.id});
    res.render("edit", {post});
})

app.get("/delete/:id", isLoggedIn, async (req, res)=>{
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    
    await postModel.findOneAndDelete({_id: req.params.id})
    res.redirect("/profile");
})

// app.get("/profile/view/:id", isLoggedIn, async (req, res)=>{
//     let user = await userModel.findOne({email: req.user.email}).populate("posts");
//     let post = await postModel.findOne({_id: req.params.id})
//     res.render("view",{user, post});
// })

app.post("/edit/:id", isLoggedIn, async (req, res)=>{
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content})
    res.redirect("/profile")
})

app.post("/profile", isLoggedIn, async (req, res)=>{
    let user = await userModel.findOne({email: req.user.email});
    let{heading, content} = req.body;
    
    let post = await postModel.create({
        user: user._id,
        heading,
        content
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
})

app.post("/login", async (req, res)=>{
    let{email, password} = req.body;
    let user = await userModel.findOne({email});

    if(!user){
        return res.status(500).send("Something went wrong!!");
    }
    bcrypt.compare(password, user.password, function(err, result){
        if(result){
            let token = jwt.sign({email: email, userid: user._id}, "shhhh")
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        } 
        else res.redirect("/login");
    })
})

app.post("/register", async (req, res)=>{
    let{username, email, mobileNumber, password, age} = req.body;
    let user = await userModel.findOne({email},{ mobileNumber})
    if(user) return res.status(500).send("User already registered");
    
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(password, salt, async function(err, hash){
            let createdUser = await userModel.create({
                username,
                email,
                mobileNumber,
                password: hash,
                age
            })
            let token = jwt.sign({email: email, userid: createdUser._id}, "shhhh");
            res.cookie("token", token);
            res.redirect("/login");
        })
    })
})

function isLoggedIn(req, res, next){
    if(req.cookies.token === "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "shhhh");
        req.user = data;
        next();
    }
}

app.listen(2000);