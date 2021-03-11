const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const { RIPEMD160 } = require("crypto-js");

// signup function
const signUpFun = async (req, res) => {
    // console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    // console.log({username,email,password})
    const user = new User({username,email,password});
    // console.log(user);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        // res.status(201).send({ user, token });
        res.cookie('token', token, { maxAge: 900000, httpOnly: true });
        res.redirect('/home');
    } catch (error) {
        // console.log(error)
        res.status(500).send(error.message);
    }
}

// signin function
const signInFun = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        // res.status(200).send({ user, token });
        res.cookie('token',token,{maxAge:900000,httpOnly:true});
        res.redirect('/home');
    } catch (error) {
        res.status(500).send({ error });
    }

}

// homefun (checking user is auntheticated or not) 
const homeFun = async (req, res) => {
    res.status(200).send({ "message": "You are auntheticated User!!!" });
}

// signout function
const signOutFun = async (req, res) => {
    const user = req.user;
    try {
        // console.log(user)
        user.tokens = user.tokens.filter((token) => {
            return token.token !== req.token
        })
        // cookies.set('testtoken', {expires: Date.now()});
        res.cookie('token', req.token, { maxAge:0, httpOnly: true });
        await user.save();
        res.redirect("/users/signup");
    } catch (error) {
        res.status(500).send({ error: error.message, tokens: user.tokens });
    }
}

// Reset password function
const resetPasswordFun = async (req, res) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    try {
        const match = await bcrypt.compare(oldPassword, req.user.password);
        if (!match) {
            throw new Error('Old Password does not match');
        }
        req.user.password = newPassword;
        req.user.tokens = []
        await req.user.save();
        // res.status(200).send({ oldPassword, newPassword });
        res.redirect("/users/signin");

    } catch (error) {
        res.status(500).send({ error:error.message })
    }
}

// forgot password function
const forgotPasswordFun = async (req, res) => {
    const email = req.body.email;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found!!!');
        }
        const token = jsonwebtoken.sign({ _id: user._id }, 'thisisresetsecret', { expiresIn: '30m' });
        user.tokens = user.tokens.concat({token});
        // console.log(user.tokens);
        await user.save();
        res.send({ token });
    } catch (error) {
        res.status(500).send({ error });
    }
}

const verifyToken = async (req, res) => {
    const verifyToken = req.params.token;
    jsonwebtoken.verify(verifyToken, 'thisisresetsecret', async (error, decoded) => {
        try {
            if (error) {
                throw new Error(error.toString());
            }
            const user = await User.findOne({_id:decoded._id});
            if(!user){
                throw new Error("User not found")
            }
            const match = await User.findOne({_id:user._id, 'tokens.token':verifyToken});
            
            if(!match){
                throw new Error("Token expired") 
            }
            user.tokens = []
            await user.save();
            res.send({"message":"Token verified"});
        } catch (err) {
            res.status(404).send({err:err.message})
        }
    });
}

const signUpUi = (req,res)=>{
    res.render('index.ejs');
}

const homeFunUI = async (req,res)=>{
    // if (!req.cookies.token) {
    //     console.log("cookie not found");
    // }
    const username = req.user.username;
    const email = req.user.email;

    res.render('home.ejs',{username,email});
}

const signInUI = async (req,res)=>{
    res.render('signin.ejs');
}

const resetPasswordUI = async (req,res)=>{
    res.render('reset_pass.ejs');
}

const forgotPasswordUI = async (req,res)=>{
    res.render('forgot_pass.ejs')
}
module.exports = {
    signUpFun,
    signInFun,
    homeFun,
    signOutFun,
    resetPasswordFun,
    forgotPasswordFun,
    verifyToken,
    signUpUi,
    homeFunUI,
    signInUI,
    resetPasswordUI,
    forgotPasswordUI
}