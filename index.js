const express = require('express')
var bodyParser = require('body-parser'); 
var jwt = require('jsonwebtoken'); // for user authentication 
var dotenv = require('dotenv').config();
const bcrypt = require('bcrypt'); // for password encryption 
var cookieParser = require('cookie-parser')
const db = require('./db.js') // importing moongoose connection module 
var User = require('./models/User.js') // importing mongoose schema 
const app = express()
const port = process.env.PORT || 500
const cors = require('cors');
app.use(cors({ origin: true })); // using cors for fetching the data from fetch api easily
app.use(cors({origin: 'http://localhost:3000',credentials: true,optionsSuccessStatus: 200}))
app.use(cookieParser())

db()


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json())

app.get('/',function(req,res){
  res.send('succes')
})

//user signup route
app.post('/user/signup',async function(req,res){
  const user = await User.findOne({email:req.body.email}) // finding user before signing in if user already exists return 'user already exists with this email '
  if(user){
    return res.json({message:"user with this email already exist ",success:'false'})
  }
  const salt = await bcrypt.genSalt(10) // making gensalt for more powerfull ecryption of password 
  const securepassword = await bcrypt.hash(req.body.password,salt) // converting password in hash password 
  const authtoken = jwt.sign({email:req.body.email},process.env.SECRET_KEY) // signing jwt token 
  let data ={name:req.body.name,email:req.body.email,number:req.body.number,password:securepassword}
  User.create(data,function(err,result){ //  creating new user 
    if(err){ //  if error on making new user retrun some thing wents wrong 
      return res.send({message:'some thing wents wrong',success:'false'}) 
    }
     res.json({message:'signup successfully',token:authtoken,success:'true'}) //  retruning jwt token to user for saving it into its cookies
  })
   
})


// auth token verification middelware 
function verify_auth_token(req,res,next){
  jwt.verify(req.headers.jwt, process.env.SECRET_KEY,function(err,result){ // verifying the user from its auth token with the help of middelware 
    if(err){
      return res.json({success:'false',message:'please login'}) //  if the auth token is invalid return 'pleas login'
    }else{
      req.user_auth = result.email 
      next()//  if the auth token is valid move ahead
    }
  })

}

//  user notes fetching route 
app.get('/user/notes',verify_auth_token,function(req,res){
  // verifying the auth token with the help of middelware 
  User.findOne({email:req.user_auth},function(err,result){
    if(err){
      return res.json({success :'false', message:'something wents wrong'})
    }
    res.json(result)  // retruning the user notes to the  user 
  })

})

// user login route 
app.post('/user/login', async function(req,res){
 
  const user = await User.findOne({email:req.body.email}) // checking if the user is exists or not 
  if(!user){ //  if user does not exists 
      return res.json({message:'please signup',success:'false'}) //  retruning 'pleae signup
  }
  const userpass = await bcrypt.compare(req.body.password, user.password); //  if user exists checking its password with the hash password
  if(!userpass){ // user hash passowrd does not matched with the user password 
    return res.json({message:'please enter valid userdetails',success:'false'}) // retruning ' please enter valid user detail '
  }
  User.findOne({email:req.body.email},function(err,result){ // finding the user 
    if(err){ // if there is problem 
      return res.json({message:'unabel to login pleas try again '}) 
    }
    const authtoken = jwt.sign({email:req.body.email},process.env.SECRET_KEY) //  genrating the auth token for the user of login 
    res.json({message:'login succesfully',token:authtoken,success:'true'}) //  retrunging the success message of login and auth token to user 
  })
  
})

// user note uploading route 
app.post('/user/notes',verify_auth_token,function(req,res){
  //verifying the auth thoke  with the help of 'verify_auth_token' middelware 
  // if the auth token verify succesfully 
  //updating the user notes with the help of token details 
    User.findOneAndUpdate({email:req.user_auth},{$push:{notes:req.body}},async function(err,result){
      if(err){
        return res.json({message:'unabel to insert notes'})
      }
      res.json({message:'notes has been updated'}) // returning the messge of success
    })
})

// updating existing user note
app.post('/user/note/update/:noteid',verify_auth_token,function(req,res){

  // verifyin the auth token with the help of middelware
  // if the auth token verify succesfully then finding the exists note and updating it 
  const noteid = req.params.noteid //  fetching the detail from the auth token passed with the middelware
  // {new:true}  new true is add to clear all objects from array and insert new object
  User.findOneAndUpdate({email :req.user_auth,'notes._id':noteid},{'$set':{'notes.$':req.body}},{new:false},function(err,item){
    if(err){
      res,json({success:'false',message:'unable to update'})
    }
    else{
      res.json({success:'true',message:'updated succesfully'}) // sending the success message 
    }
  })
  

})

// deleting user note route
app.get('/user/note/delete/:noteid',verify_auth_token,function(req,res){
  // verifying auth token with the help of middelware  
  const noteid = req.params.noteid //  getting the user detail from the auth token 
  User.findOneAndUpdate({email:req.user_auth,'notes._id':noteid},{'$pull':{'notes':{_id:noteid}}},function(err,result){
    if(err){
      return res.json({message:'unable to delete try again',success:'false'})
    } 
    res.json({message:'sucesss',success:'true'}) // sending the success message 
  })

})
app.listen(port)