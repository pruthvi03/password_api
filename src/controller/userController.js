const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const mailgun = require("mailgun-js");

// signup function
const signUpFun = async (req, res) => {
    // console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    // console.log({username,email,password})
    const user = new User({ username, email, password });
    // console.log(user);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        // res.status(201).send({ user, token });
        res.cookie('token', token, { maxAge: 900000, httpOnly: true });
        req.flash('success_msg', 'Account Created Successfully');
        res.redirect('/home');
    } catch (error) {
        // console.log(error)
        req.flash('error_msg', error.message);
        res.redirect('/users/signup')
    }
}

// signin function
const signInFun = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        if(!email || !password){
            throw new Error("All fields are required");
        }
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        // res.status(200).send({ user, token });
        res.cookie('token', token, { maxAge: 900000, httpOnly: true });
        req.flash('success_msg', 'Signed In Successfully');
        res.redirect('/home');
    } catch (error) {
        // res.status(500).send({ error });
        req.flash('error_msg', error.message);
        res.redirect('/users/signin')
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
        res.cookie('token', req.token, { maxAge: 0, httpOnly: true });
        await user.save();
        req.flash('success_msg', 'Signed Out Successfully');
        res.redirect("/users/signup");
    } catch (error) {
        // res.status(500).send({ error: error.message, tokens: user.tokens });
        req.flash('error_msg', error.message);
        res.redirect('/users/signout')
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
        req.flash('success_msg', 'Password changed Successfully');
        res.redirect("/users/signin");

    } catch (error) {
        // res.status(500).send({ error:error.message })
        req.flash('error_msg', error.message);
        res.redirect('/users/signup')
    }
}

// forgot password function
const forgotPasswordFun = async (req, res) => {
    const email = req.body.email;
    // console.log(email)
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found!!!');
        }
        const token = jsonwebtoken.sign({ _id: user._id }, 'thisisresetsecret', { expiresIn: '30m' });
        user.tokens = user.tokens.concat({ token });
        // console.log(user.tokens);
        await user.save();
        // res.send({ token });
        const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAIL_DOMAIN });
        const link = `http://localhost:3000/users/verification/${token}`;
        const data = {
            from: 'Pruthvi Password API <me@samples.mailgun.org>',
            to: email,
            subject: 'Reset Password',
            text: link
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });
        req.flash('success_msg', 'Mail sent Successfully');
        res.redirect("/users/signin");
    } catch (error) {
        // res.status(500).send({ error });
        req.flash('error_msg', error.message);
        res.redirect('/users/forgot-password')
    }
}

const verifyToken = async (req, res) => {
    const verifyToken = req.params.token;
    jsonwebtoken.verify(verifyToken, 'thisisresetsecret', async (error, decoded) => {
        try {
            if (error) {
                throw new Error(error.toString());
            }
            const user = await User.findOne({ _id: decoded._id });
            if (!user) {
                throw new Error("User not found")
            }
            const match = await User.findOne({ _id: user._id, 'tokens.token': verifyToken });

            if (!match) {
                throw new Error("Token expired")
            }
            // user.tokens = []
            await user.save();
            // res.send({"message":"Token verified"});
            req.flash('success_msg', 'Token verified Successfully');
            res.redirect('/users/new-password/' + verifyToken);
        } catch (err) {
            // res.status(404).send({err:err.message})
            req.flash('error_msg', error.message);
            res.redirect('/users/signup')
        }
    });
}

const signUpUi = (req, res) => {
    res.render('index.ejs');
}

const homeFunUI = async (req, res) => {
    // if (!req.cookies.token) {
    //     console.log("cookie not found");
    // }
    const username = req.user.username;
    const email = req.user.email;
    res.render('home.ejs', { username, email });
}

const signInUI = async (req, res) => {
    res.render('signin.ejs');
}

const resetPasswordUI = async (req, res) => {
    res.render('reset_pass.ejs');
}

const forgotPasswordUI = async (req, res) => {
    res.render('forgot_pass.ejs')
}

const newPassUI = async (req, res) => {
    res.render('new_pass.ejs');
}
const newPassFun = async (req, res) => {
    const verifyToken = req.params.token;
    jsonwebtoken.verify(verifyToken, 'thisisresetsecret', async (error, decoded) => {
        try {
            if (error) {
                throw new Error(error.toString());
            }
            const user = await User.findOne({ _id: decoded._id });
            if (!user) {
                throw new Error("User not found")
            }
            const match = await User.findOne({ _id: user._id, 'tokens.token': verifyToken });

            if (!match) {
                throw new Error("Token expired")
            }
            const newPassword = req.body.newPassword
            const newPassword2 = req.body.newPassword2
            if (newPassword !== newPassword2) {
                res.redirect("/users/new-password/" + verifyToken);
            }
            user.tokens = [];
            user.password = newPassword;
            await user.save();
            // res.send({"message":"Token verified"});
            req.flash('success_msg', 'New password is saved');
            res.redirect('/users/signin');
        } catch (err) {
            // res.status(404).send({ err: err.message })
            req.flash('error_msg', error.message);
            res.redirect('/users/signup')
        }
    });
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
    forgotPasswordUI,
    newPassFun,
    newPassUI
}