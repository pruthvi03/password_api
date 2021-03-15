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

// home router
userRouter.route("/")
    .get(auth, userFuncs.homeFunUI)
    .delete(auth, userFuncs.deleteUserFun);

// signup Ui
userRouter.route('/users/signup')
    .get(userFuncs.signUpUi)
    .post(userFuncs.signUpFun);

// signin router
userRouter.route("/users/signin")
    .get(userFuncs.signInUI)
    .post(userFuncs.signInFun);

// signout router
userRouter.route("/users/signout")
    .get(auth, userFuncs.signOutFun);


// reset password router
userRouter.route("/users/reset-password")
    .get(auth, userFuncs.resetPasswordUI)
    .post(auth, userFuncs.resetPasswordFun);

// forgot password router
userRouter.route("/users/forgot-password")
    .get(userFuncs.forgotPasswordUI)
    .post(userFuncs.forgotPasswordFun);

// new password router
userRouter.route("/users/new-password/:token")
    .get(forgot_pass, userFuncs.newPassUI)
    .post(userFuncs.newPassFun);

// avatar router
userRouter.route("/users/change-avatar")
    .get(auth, userFuncs.avatarUploadUI)
    .post(auth, userFuncs.upload.single('avatar') ,userFuncs.avatarUploadFun)
    .delete(auth, userFuncs.avatarDeleteFun)

module.exports = userRouter;







