require("dotenv").config()
const express = require("express")
const body_parser = require("body-parser")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const ejs = require("ejs")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")



const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(body_parser.urlencoded({extended: true}))

// Cookies Session
app.use(session({
    secret: "This is my secret",
    resave: false,
    saveUninitialized: false
})) 

app.use(passport.initialize())
app.use(passport.session())

// Connection
mongoose.connect("mongodb://localhost:27017/securityDB")

// Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: String
})

userSchema.plugin(passportLocalMongoose)

// Plugin
// userSchema.plugin(encryption, {secret:process.env.SECRET, encryptedFields: ["password"]})

// Model
const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Home
app.route("/")
.get(function(req, res){
    res.render("home")
})

// Secrets
app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
})

// Log in
app.route("/login")
.get(function(req, res){
    res.render("login")
})
.post(function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })    

    req.logIn(user, function(err){
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })
        
})

// Register
app.route("/register")
.get(function(req, res){
    res.render("register")
})
.post(function(req, res){
    // const newUser = new User({username: req.body.username})
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })
})

// logout
app.route("/logout")
.get(function(req, res){
    req.logOut(function(err) {
        if(err){
            console.log("errrrrror")
            console.log(err)
        }else{
            console.log("logout successfuly")
            res.redirect("/")
        }
    })
   
})



app.listen(3000, function(){
    console.log("Servier has been connected")
})