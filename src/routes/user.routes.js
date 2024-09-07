const express = require('express');
const userRouter = express.Router();
const {
    registerUser,
    loginUser,
    userProfile,
    updateUser,
    changePassword,
} = require('../controllers/user.controller');
const upload = require('../helpers/uploadImage');
const { vertifyToken } = require("../helpers/authentication");


userRouter.post('/register', upload.fields([
    {
    name: 'avatar',
    maxCount: 1,
    },
    {
        name: 'coverImage',
        maxCount: 1,
    }]),
    registerUser );

userRouter.post('/login', loginUser );

userRouter.get("/me", vertifyToken, userProfile);
userRouter.put("/update", vertifyToken, upload.fields([
    {
        name: 'avatar',
        maxCount: 1,
    },
    {
        name: 'coverImage',
        maxCount: 1,
    }]), updateUser);
userRouter.put("/change-password", vertifyToken, changePassword);

module.exports = userRouter;