const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const mailgun = require("mailgun-js");
const Cryptr = require('cryptr');
const multer = require('multer');
const sharp = require('sharp');


const homeFunUI = (req, res) => {
    const { username, email, avatar } = req.user;
    var avatar_img;
    if (avatar) {
        avatar_img = 'data:image/jpeg;base64,' + req.user.avatar.toString('base64');
    }
    else { avatar_img = "..."; }
    res.render('home', { username, email, avatar: avatar_img });
}

const signUpUi = (req, res) => {
    res.render('signup');
}
// signup function
const signUpFun = async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        // res.status(201).send({ user, token });
        res.cookie('token', token, { maxAge: 900000, httpOnly: true });
        req.flash('success_msg', 'Account Created Successfully');
        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/users/signup')
    }
}




const signInUI = (req, res) => {
    res.render('signin.ejs');
}
// signin function
const signInFun = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            throw new Error("All fields are required");
        }
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        // res.status(200).send({ user, token });
        res.cookie('token', token, { maxAge: DateTime.Now.AddDays(30), httpOnly: true });
        req.flash('success_msg', 'Signed In Successfully');
        res.redirect('/');
    } catch (error) {
        // res.status(500).send({ error });
        req.flash('error_msg', error.message);
        res.redirect('/users/signin')
    }

}

// signout function
const signOutFun = async (req, res) => {
    const user = req.user;
    try {
        user.tokens = user.tokens.filter((token) => {
            return token.token !== req.token
        })
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



const resetPasswordUI = (req, res) => {
    res.render('reset_pass.ejs');
}
// Reset password function
const resetPasswordFun = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
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




const forgotPasswordUI = (req, res) => {
    res.render('forgot_pass.ejs')
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
        const cryptr = new Cryptr('myTotalySecretKey');
        const encrypted = cryptr.encrypt(token);

        user.tokens = user.tokens.concat({ token: encrypted });
        await user.save();
        // res.send({ token });
        const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAIL_DOMAIN });
        const link = `http://localhost:3000/users/new-password/${encrypted}`;
        const data = {
            from: 'Pruthvi Password API <me@samples.mailgun.org>',
            to: email,
            subject: 'Reset Password',
            text: link
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });
        req.flash('success_msg', `Mail sent Successfully to ${email}`);
        res.redirect("/users/signin");
    } catch (error) {
        // res.status(500).send({ error });
        req.flash('error_msg', error.message);
        res.redirect('/users/forgot-password')
    }
}


const newPassUI = (req, res) => {
    res.render('new_pass.ejs', { _id: req.userID, token: req.token });
}
const newPassFun = async (req, res) => {
    try {
        const { newPassword, newPassword2 } = req.body;
        if (newPassword !== newPassword2) {
            throw new Error("Both passwords were not same");
        }
        const user = await User.findOne({ _id: req.body._id });
        user.tokens = [];
        user.password = newPassword;
        await user.save();
        // res.send({"message":"Token verified"});
        req.flash('success_msg', 'New password is saved');
        res.redirect('/users/signin');
    } catch (err) {
        // res.status(404).send({ err: err.message })
        req.flash('error_msg', err.message);
        res.redirect('/users/new-password/' + req.body.token);
    }
}

const avatarUploadUI = (req, res) => {
    var avatar;
    if (req.user.avatar) {
        avatar = 'data:image/jpeg;base64,' + req.user.avatar.toString('base64');
    }
    else { avatar = "" };
    res.render("avatar", { avatar });
}
// multer
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        // cb(new Error('File must be a PDF'));
        // cb(undefined,true);
        // cb(undefined,false);
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload a image'));
        }
        cb(undefined, true);
    }
});

const avatarUploadFun = async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        // res.status(200).send({ message: "file recieved" });
        req.flash('success_msg', 'New avatar is saved');
        res.redirect('/users/change-avatar/');
    } catch (error) {
        // req.status(500).send({ error: error.message });
        req.flash('error_msg', error.message);
        res.redirect('/users/change-avatar/');
    }
}

const avatarDeleteFun = async (req, res) => {
    try {
        req.user.avatar = "";
        await req.user.save();
        req.flash('success_msg', 'Avatar is deleted');
        res.redirect('/users/change-avatar/');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/users/change-avatar/');
    }
}

const deleteUserFun = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user._id })
        req.flash('success_msg', 'User is deleted');
        res.redirect('/users/signup/');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/users/signup/');
    }
}

module.exports = {
    homeFunUI,
    signUpUi,
    signUpFun,
    signInUI,
    signInFun,
    signOutFun,
    resetPasswordUI,
    resetPasswordFun,
    forgotPasswordUI,
    forgotPasswordFun,
    newPassFun,
    newPassUI,
    avatarUploadUI,
    upload,
    avatarUploadFun,
    avatarDeleteFun,
    deleteUserFun
}