const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const { RIPEMD160 } = require("crypto-js");

// signup function
const signUpFun = async (req, res) => {
    console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    console.log({username,email,password})
    const user = new User({username,email,password});
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(500).send({ error: error });
    }
}

// signin function
const signInFun = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
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
    try {
        const user = req.user;
        user.tokens = user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await user.save();
        res.send({ message: "logged out" });
    } catch (error) {
        res.status(500).send({ error: error, tokens: user.tokens });
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
        await req.user.save();
        res.status(200).send({ oldPassword, newPassword });

    } catch (error) {
        res.status(500).send({ error })
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
        console.log(user.tokens);
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

const homeFunUI = (req,res)=>{
    res.render('home.ejs');
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
    homeFunUI
}