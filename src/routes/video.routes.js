const express = require('express');
const {publishNewVideo, getAllVideos} = require("../controllers/video.controller");
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

module.exports = videoRoutes;