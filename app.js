require("dotenv").config()
const express = require("express")
const body_parser = require("body-parser")
const mongoose = require("mongoose")
// const encryption = require("mongoose-encryption")
// const md5 = require("md5")
const bcrypt = require("bcrypt")
const ejs = require("ejs")


const saltround = 10
const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(body_parser.urlencoded({extended: true}))

// Connection
mongoose.connect("mongodb://localhost:27017/userDB")

// Schema
const userSchema = ({
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
// userSchema.plugin(encryption, {secret:process.env.SECRET, encryptedFields: ["password"]})

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
    // let user_password = md5(req.body.password)
    

    User.findOne({email: user_email}).then((result) =>{
        bcrypt.compare(req.body.password, result.password, function(err, hash){
            if (hash === true){
                res.render("secrets")
            }else{
                res.send("Password incorrect")
            }
        })
     
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
    // let input_password = md5(req.body.password)
    bcrypt.hash(req.body.password, saltround, function(err, hash){
        const data = new User({
            email: input_email,
            password: hash
        })
        data.save().then(() =>{
            res.render("secrets")
        }).catch(() =>{
            res.send("Full all the field")
        })
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