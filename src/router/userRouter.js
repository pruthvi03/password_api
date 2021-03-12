const express = require('express');
const userRouter = express.Router();
const auth = require('../middleware/auth');
const forgot_pass = require('../middleware/forgot_pass');
const userFuncs = require('../controller/userController');

//                  Task
// create user model
// user Fields are: username, email, password,
// Sign up
// - Sign in (authentication using JWT) 
// - forget password ( via link )
// - Reset password (via link )
// - Link expiration within 30 minutes.
// - Note: If I copy paste token on jwt.io it should not show any details (hint: encrypt JWT token)

userRouter.get("/", auth,userFuncs.homeFunUI);

// signup Ui
userRouter.get('/users/signup',userFuncs.signUpUi);
userRouter.post('/users/signup', userFuncs.signUpFun);

userRouter.get("/users/signin",userFuncs.signInUI);
userRouter.post('/users/signin', userFuncs.signInFun);

userRouter.get("/users/signout",auth, userFuncs.signOutFun)

userRouter.get("/users/reset-password",auth,userFuncs.resetPasswordUI);
userRouter.post("/users/reset-password",auth,userFuncs.resetPasswordFun);

// forgot password router
userRouter.get("/users/forgot-password",userFuncs.forgotPasswordUI);
userRouter.post('/users/forgot-password',userFuncs.forgotPasswordFun);

userRouter.get("/users/new-password/:token",forgot_pass,userFuncs.newPassUI);
userRouter.post("/users/new-password/:token",userFuncs.newPassFun)

module.exports = userRouter;







