const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
   username: {
       type: String,
       unique: true,
       lowercase: true,
       trim: true,
       index: true,
   } ,
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName:{
       type: String,
        trim: true,
    },
        avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "videos",
        },
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    },
},
    {
        versionKey: false,
        timestamps: true
    });

//
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            userId: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        // {
        //     expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        // }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            userId: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        // {
        //     expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        // }
    );
};

module.exports = mongoose.model('users', userSchema);
