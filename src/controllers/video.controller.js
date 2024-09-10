const { MSG } = require('../utils/messages');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { StatusCodes } = require('http-status-codes');
const { uploadCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary} = require('../utils/cloudinary');
const videoService = require('../services/video.service');
const userService = require('../services/user.service');

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

/**
 * name: Get Single Video
 * Method: "GET"
 * End-point: /api/v1/video/single-video
 * */
exports.getVideo = async (req, res) => {
    try{
        let video = await videoService.findVideo({_id: req.query.videoId});
        if(!video)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));

        let user = await userService.findUserById(req.user._id);
        if(!user)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));

        // Check User's watchlist in video already added or not
        if(!user.watchHistory.includes(req.query.videoId)){
            await videoService.updateVideo(video._id, {$inc: {views: 1}});
        }

        await userService.updateUser(user._id, {$addToSet:{watchHistory: video._id}});
        video = await videoService.getAllVideos(req.query, req.user._id);
        res.send(successResponse(StatusCodes.OK, false, MSG.FOUND_SUCCESS, video));
    } catch (err) {
        console.log(err);
        return err;
    }
};

/**
 * name: Update Video
 * Method: "PUT"
 * End-point: /api/v1/video/
 * */
exports.updateVideo = async (req, res) => {
    try{
        let videoFile = await videoService.findVideo({_id: req.query.videoId});
        if(!videoFile)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));

        if(req.files.thumbnail){
            await deleteFromCloudinary(videoFile.thumbnail.publicId);
            let thumbnailPath = req.files?.thumbnail[0]?.path;
            const thumbnail = await uploadCloudinary(thumbnailPath);
            req.body.thumbnail = {publicId: thumbnail.public_id, url: thumbnail.url};
        }
        videoFile = await videoService.updateVideo(videoFile._id, {...req.body});
        res.send(successResponse(StatusCodes.OK, false, MSG.UPDATED_SUCCESS, videoFile));
    } catch (err) {
        console.log(err);
        return err;
    }
};


/**
 * name: Delete Video
 * Method: "DELETE"
 * End-point: /api/v1/video/
 * */
exports.deleteVideo = async (req, res) => {
    try{
        let video = await videoService.findVideo({_id: req.query.videoId});
        if(!video)
            return res.send(errorResponse(StatusCodes.NOT_FOUND, true, MSG.NOT_FOUND));
        if(video.owner.toString() !== req.user._id.toString())
            return res.send(errorResponse(StatusCodes.UNAUTHORIZED, true, MSG.UNAUTHORIZED));

        let deleteVideoFile = await deleteVideoFromCloudinary(video.videoFile.publicId);
        let deleteThumbnail = await deleteFromCloudinary(video.thumbnail.publicId);

        if(!(deleteThumbnail.result === 'ok') || !(deleteVideoFile.result === 'ok'))
            return res.send(errorResponse(StatusCodes.BAD_REQUEST, true, MSG.BAD_REQUEST));

        video = await videoService.deleteVideo(video._id);
        await userService.updateUserByFiled(req.query.videoId, {$pull:{watchHistory: req.query.videoId}})
        res.send(successResponse(StatusCodes.OK, false, MSG.DELETE_SUCCESS, video));
    } catch (err) {
        console.log(err);
        return err;
    }
};