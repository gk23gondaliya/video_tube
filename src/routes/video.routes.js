const express = require('express');
const {publishNewVideo, getAllVideos, getVideo, updateVideo, deleteVideo} = require("../controllers/video.controller");
const {vertifyToken} = require("../helpers/authentication");
const upload = require('../helpers/uploadImage');
const videoRoutes = express.Router();

videoRoutes.post("/", vertifyToken, upload.fields([
    {
        name: 'videoFile',
        maxCount: 1,
    },
    {
        name: 'thumbnail',
        maxCount: 1,
    }]), publishNewVideo);

videoRoutes.get("/", vertifyToken, getAllVideos);
videoRoutes.get("/single-video", vertifyToken, getVideo);
videoRoutes.put("/", vertifyToken, upload.fields([{
    name: 'thumbnail',
    maxCount: 1,
}]), updateVideo);
videoRoutes.delete("/", vertifyToken, deleteVideo);

module.exports = videoRoutes;