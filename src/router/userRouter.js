const express = require('express');
const userRouter = express.Router();
const auth = require('../middleware/auth');
const forgot_pass = require('../middleware/forgot_pass');
const userFuncs = require('../controller/userController');
const mailgun = require("mailgun-js");
// var Mailgun = require('mailgun-js');


//                  Task
// create user model
// user Fields are: username, email, password,
// Sign up
// - Sign in (authentication using JWT) 
// - forget password ( via link )
// - Reset password (via link )
// - Link expiration within 30 minutes.
// - Note: If I copy paste token on jwt.io it should not show any details (hint: encrypt JWT token)

userRouter.post('/users/signup', userFuncs.signUpFun);

userRouter.post('/users/signin', userFuncs.signInFun);


// userRouter.post("/users/signout", auth, userFuncs.signOutFun);

userRouter.post("/users/reset-password",auth,userFuncs.resetPasswordFun);


// signup Ui
userRouter.get('/users/signup',userFuncs.signUpUi);

userRouter.get("/users/home", auth, userFuncs.homeFun);

userRouter.get("/", auth,userFuncs.homeFunUI);

userRouter.get("/users/signout",auth, userFuncs.signOutFun)

userRouter.get("/users/signin",userFuncs.signInUI);

userRouter.get("/users/reset-password",auth,userFuncs.resetPasswordUI);

userRouter.get("/users/forgot-password",userFuncs.forgotPasswordUI);

// forgot password router
userRouter.post('/users/forgot-password',userFuncs.forgotPasswordFun);

// verify token

userRouter.get("/users/new-password/:token",forgot_pass,userFuncs.newPassUI);

userRouter.post("/users/new-password/:token",userFuncs.newPassFun)

module.exports = userRouter;
