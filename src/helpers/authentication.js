const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { errorResponse } = require("../utils/apiResponse");
const { StatusCodes } = require("http-status-codes");
const { MSG } = require("../utils/messages");

exports.vertifyToken = async function (req, res, next) {
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token)
            return res.send(errorResponse(StatusCodes.UNAUTHORIZED, true, MSG.UNAUTHORIZED));
        let {userId} = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({_id: userId}).select("-password -refreshToken");
        if(!user)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));
        req.user = user;
        next();
    }catch (err) {
        console.log(err);
        res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, true, MSG.INTERNAL_SERVER_ERROR));
    }
};