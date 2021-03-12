const User = require("../models/users");
const jsonwebtoken = require("jsonwebtoken");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

const forgot_pass = async (req, res, next) => {
    const token = req.params.token;
    console.log(token)
    try {
        if (!token) {
            throw new Error("Token not found");
        }

        const originalText = cryptr.decrypt(token);
        console.log(originalText);
        await jsonwebtoken.verify(originalText, "thisisresetsecret", async (error, decoded) => {
            try {

                if (error) {
                    throw new Error(error);
                }
                const user = await User.findOne({ _id: decoded._id });
                if (!user) {
                    throw new Error("User not found")
                }
                const match = await User.findOne({ _id: decoded._id, 'tokens.token': token })
                if (!match) {
                    throw new Error("Token Expired")
                }
                req.userID = user._id;
                req.token = token;
                console.log(req.userID)
                next()
            } catch (error) {
                req.flash("error_msg", error.message);
                res.redirect("/users/signup")
            }
        })
    } catch (error) {
        console.log(error)
        req.flash("error_msg", error.message);
        res.redirect("/users/signup")
    }
}

module.exports = forgot_pass