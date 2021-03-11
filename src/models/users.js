const mongoose = require('mongoose');
const validator = require('validator');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var CryptoJS = require("crypto-js");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Please Insert Standard Email Id');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value) {
            if (value.includes("password")) {
                throw new Error('Please Insert Proper Password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }
    ]
}, { timestamps: true });

// userSchema.statics.findByCredntials()
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error('User Not Found');
    }
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
        throw new Error('Invalid Password');
    }
    return user;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    try {

        const token = await jsonwebtoken.sign({ _id: user._id.toString() }, 'thisismysecret');
        // Encrypt
        var ciphertext = CryptoJS.AES.encrypt(token, 'secret key 123').toString();
        // console.log("ciphertext: ", ciphertext)

        user.tokens = user.tokens.concat({ token: ciphertext });
        // console.log("user.tokens:= ",user.tokens)
        await user.save();
        return ciphertext
    } catch (error) {
        throw new Error({ "error": error.message });
    }
}

const User = mongoose.model("User", userSchema);
module.exports = User;
