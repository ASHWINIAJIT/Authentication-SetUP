//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.SECRET);

app.use(express.static("public"));
app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/authDB" , {useNewUrlParser: true , useUnifiedTopology: true , useCreateIndex:true});

const userSchema = new mongoose.Schema({

  Name :{type:String},
  Email : {type:String, unique:true},
  Password : {type:String, minLength:5 },
});

userSchema.plugin(encrypt, {secret:process.env.SECRET , encryptedFields: ['Password']});

const User = new mongoose.model("User" , userSchema);

app.get("/" , function(req,res){
  res.render("home");
});

app.get("/login" , function(req, res){
  res.render("login");
});

app.get("/register" , function(req, res){

  res.render("register");
});

app.post("/login" , function(req, res){

  let username = req.body.username;
  let password = req.body.password;

  User.findOne({Email:username} , function(err , foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(foundUser.Password === password){
          res.render("secrets");
        }else{
          var alert =[];
          alert=[{msg:"Incorrect Password!"}];
          res.render("login", {alert:alert});
        }
      }else{
        var alert =[];
        alert=[{msg:"User does not found!"}];
        res.render("login", {alert:alert});
      }

    }

  });

});

app.post("/register", function(req, res){

    User.findOne({Email:req.body.username} , function(err , foundUser){
      if(err){
        console.log(err);
      }else{
        if(foundUser){
          res.render("register");
        }else{

          const newUser = new User({
            Name : req.body.name,
            Email : req.body.username,
            Password : req.body.password,
          });

          newUser.save(function(err){
            if(err){
              console.log(err);
            }else{
              res.render("login");
            }
          });

        }

      }
    });

});


app.listen(3000 , function(){
  console.log("server is running on port 3000.");
});
