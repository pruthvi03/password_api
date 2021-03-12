var CryptoJS = require("crypto-js");
var jsonwebtoken = require("jsonwebtoken");
const User = require("../models/users");

const auth = async (req, res, next) => {
    try {
        // const token = req.header("Authorization").replace('Bearer ', '');
        const token = req.cookies['token'];
        if (!token) {
            throw new Error('please login')
        }

        // Decrypt
        var bytes = await CryptoJS.AES.decrypt(token, 'secret key 123');
        var originalText = bytes.toString(CryptoJS.enc.Utf8);

        const decoded = await jsonwebtoken.verify(originalText, 'thisismysecret');
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) { throw new Error('User not Found!!!') }
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        // res.status(401).send({ error: 'Please authenticate' });
        req.flash("error_msg","Error: "+error.message);
        res.redirect('/users/signin')
    }
}

module.exports = auth;