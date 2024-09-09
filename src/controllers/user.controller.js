const userService = require('../services/user.service');
const { MSG } = require('../utils/messages');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { StatusCodes } = require('http-status-codes');
const { uploadCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * Generating Access & Refresh Tokens
 * */
const getRefreshAndAccessTokens = async (userId) => {
    try{
        const user = await userService.findUserById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();
        return { accessToken, refreshToken };
    }catch (err) {
        console.log(err);
        return err;
    }
}

/**
 * name: Register User
 * Method: "POST"
 * End-point: /api/v1/users/register
 * */
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, username } = req.body;

        if( [fullName, email, password, username].some(field => field?.trim() === ""))
            return res.send(errorResponse(StatusCodes.BAD_REQUEST, true, MSG.BAD_REQUEST));

        const existUser = await userService.findUser({$or:[{username}, {email}]});
        if(existUser)
            return res.send(errorResponse(StatusCodes.BAD_REQUEST, true, MSG.ALREADY_EXISTS,existUser));

        let hashPassword = await userService.hashPassword(password);
        if(req.files.avatar) {
            let avatarPath = req.files?.avatar[0]?.path;
            const avtar = await uploadCloudinary(avatarPath);
            req.body.avatar = avtar.url || "";
        }

        if(req.files.coverImage && req.files.coverImage.length > 0) {
            let coverImagePath = req.files?.coverImage[0]?.path;
            const coverImage = await uploadCloudinary(coverImagePath);
            req.body.coverImage = coverImage.url || "";
        }
        const user = await userService.createUser({...req.body, password: hashPassword, username: username.toLowerCase()});
        res.send(successResponse(StatusCodes.CREATED, false, MSG.CREATE_SUCCESS, {user}));
    } catch (err) {
        console.log(err);
        res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, true, MSG.INTERNAL_SERVER_ERROR));
    }
};

/**
 * name: Login User
 * Method: "POST"
 * End-point: /api/v1/users/login
 * */
exports.loginUser = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if( !(username || email) )
            return res.send(errorResponse(StatusCodes.BAD_REQUEST, true, MSG.USERNAME_EMAIL_REQUIRED));

        let user = await userService.findUser({$or:[{username}, {email}]});
        if(!user)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));

        let isPasswordValid = await userService.checkPassword(user?._id, password);
        if(!isPasswordValid)
            return res.send(errorResponse(StatusCodes.BAD_REQUEST, true, MSG.PASSWORD_NOT_MATCHED));

        const { accessToken } = await getRefreshAndAccessTokens(user._id)
        res.send(successResponse(StatusCodes.CREATED, false, MSG.LOGIN_SUCCESS, {user, accessToken}));
    } catch (err) {
        console.log(err);
        res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, true, MSG.INTERNAL_SERVER_ERROR));
    }
};

/**
 * name: User Profile
 * Method: "GET"
 * End-point: /api/v1/users/me
 * */
exports.userProfile = async (req, res) =>{
    try{
        res.send(successResponse(StatusCodes.OK, false, MSG.FOUND_SUCCESS, {user: req.user}))
    } catch (err) {
        console.log(err);
        res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, true, MSG.INTERNAL_SERVER_ERROR));
    }
}

/**
 * name: Profile Update
 * Method: "PUT"
 * End-point: /api/v1/users/update
 * */
exports.updateUser = async (req, res) =>{
    try{
        let user = await userService.findUserById(req.user._id);
        if(!user)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));
        if(req.files.avatar) {
            await deleteFromCloudinary(user.avatar);
            let avatarPath = req.files?.avatar[0]?.path;
            const avtar = await uploadCloudinary(avatarPath);
            req.body.avatar = avtar.url || "";
        }

        if(req.files.coverImage && req.files.coverImage.length > 0) {
            await deleteFromCloudinary(user.coverImage);
            let coverImagePath = req.files?.coverImage[0]?.path;
            const coverImage = await uploadCloudinary(coverImagePath);
            req.body.coverImage = coverImage.url || "";
        }
        user = await userService.updateUser(req.user._id, req.body);
        user = await userService.findUser({_id: user._id});
        res.send(successResponse(StatusCodes.OK, false, MSG.UPDATED_SUCCESS, {user}));
    } catch (err) {
        console.log(err);
        res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, true, MSG.INTERNAL_SERVER_ERROR));
    }
};


/**
 * name: Update Password
 * Method: "PUT"
 * End-point: /api/v1/users/change-password
 * */
exports.changePassword = async (req, res) =>{
    try{
        let user = await userService.findUserById(req.user._id);
        if(!user)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));
        let matchedPassword = await userService.checkPassword(user._id, req.body.oldPassword);

        if(!matchedPassword)
            return res.send(errorResponse(StatusCodes.BAD_REQUEST, false, MSG.PASSWORD_NOT_MATCHED));
        let hashPassword = await userService.hashPassword(req.body.newPassword);

        user = await userService.updateUser(req.user._id, {password: hashPassword});
        user = await userService.findUser({ _id: user._id });
        res.send(successResponse(StatusCodes.OK, false, MSG.PASSWORD_UPDATED, {user}));
    } catch (err) {
        console.log(err);
        res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, true, MSG.INTERNAL_SERVER_ERROR));
    }
};