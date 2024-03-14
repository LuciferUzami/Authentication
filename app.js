require("dotenv").config()
const express = require("express")
const body_parser = require("body-parser")
const mongoose = require("mongoose")
const encryption = require("mongoose-encryption")
const ejs = require("ejs")

const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(body_parser.urlencoded({extended: true}))

// Connection
mongoose.connect("mongodb://localhost:27017/userDB")

// Schema
const userSchema = new mongoose.Schema({
    email :{
        type: String,
        required: true,
        trim: true
        
    },
    password :{
        type: String,
        required: true,
        trim: true
    }
})
// Plugin
userSchema.plugin(encryption, {secret:process.env.SECRET, encryptedFields: ["password"]})

// Model
const User = new mongoose.model("User", userSchema)

// Home
app.route("/")
.get(function(req, res){
    res.render("home")
})

// Log in
app.route("/login")
.get(function(req, res){
    res.render("login")
})
.post(function(req, res){
    let user_email = req.body.username
    let user_password = req.body.password

    User.findOne({email: user_email}).then((result) =>{
        if (result.password === user_password){
            res.render("secrets")
        }else{
            res.send("Password incorrect")
        }
    }).catch(() =>{
        res.send("Invalid email")
    })
})

// Register
app.route("/register")
.get(function(req, res){
    res.render("register")
})
.post(function(req, res){
    let input_email = req.body.username
    let input_password = req.body.password

    const data = new User({
        email: input_email,
        password: input_password
    })

    data.save().then(() =>{
        res.render("secrets")
    }).catch(() =>{
        res.send("Full all the field")
    })
})

// logout
app.route("/logout")
.get(function(req, res){
    res.render("home")
})

app.listen(3000, function(){
    console.log("Servier has been connected")
})