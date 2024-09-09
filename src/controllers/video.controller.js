const { MSG } = require('../utils/messages');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { StatusCodes } = require('http-status-codes');
const { uploadCloudinary } = require('../utils/cloudinary');
const videoService = require('../services/video.service');

/**
 * name: Publish New Video
 * Method: "POST"
 * End-point: /api/v1/video/
 * */
exports.publishNewVideo = async (req, res) => {
    try{
        let ownerId = req.user._id;
        if(!ownerId){
            res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));
        }
            let videoFilePath = req.files?.videoFile[0]?.path;
            const videoFile = await uploadCloudinary(videoFilePath);

            let thumbnailPath = req.files?.thumbnail[0]?.path;
            const thumbnail = await uploadCloudinary(thumbnailPath);

        let publishVideo = await videoService.createVideo({
            title: req.body.title,
            description: req.body.description,
            videoFile: {publicId: videoFile.public_id, url: videoFile.url},
            thumbnail: {publicId: thumbnail.public_id, url: thumbnail.url},
            duration: videoFile.duration,
            owner: ownerId,
        });
        res.send(successResponse(StatusCodes.CREATED, false, MSG.CREATE_SUCCESS,  publishVideo));
    } catch (err) {
        console.log(err);
        return err;
    }
};

/**
 * name: Get All Publish Video
 * Method: "GET"
 * End-point: /api/v1/video/
 * */
exports.getAllVideos = async (req, res) => {
    try{
        let videos = await videoService.getAllVideos(req.query, req.user._id);
        res.send(successResponse(StatusCodes.OK, false, MSG.FOUND_SUCCESS, videos));
    } catch (err) {
        console.log(err);
        return err;
    }
};