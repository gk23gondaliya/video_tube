const Video = require('../models/video.model');
const mongoose = require("mongoose");

class VideoServices {
    // Add New Video
    async createVideo(body) {
        try{
            return await Video.create(body);
        }catch(err) {
            return err;
        }
    };

    // Get Video
    async findVideo(body) {
        try{
            return await Video.findOne(body);
        }catch(err) {
            return err;
        }
    };

    // Update Video
    async updateVideo(videoId, body) {
        try{
            return await Video.findByIdAndUpdate(videoId, body, {new: true});
        }catch(err) {
            return err;
        }
    };

    // Delete Video
    async deleteVideo(videoId) {
        try{
            return await Video.findByIdAndDelete(videoId);
        }catch(err) {
            return err;
        }
    };

    // Get All Videos
    async getAllVideos(query, userId) {
        try{
            let pageNo = parseInt(query.pageNo) || 1;
            let perPage = parseInt(query.perPage) || 50;
            let skip = (pageNo - 1) * perPage;

            let matchCondition = [];
            if(query.search) {
                matchCondition.push({
                    $match: {
                        $or: [
                            {title: {$regex: query.search, $options: 'i'}},
                            {description: {$regex: query.search, $options: 'i'}}
                        ]
                    }
                })
            }

            if (query.me && query.me === "true"){
                matchCondition.push({
                    $match: {
                        owner : new mongoose.Types.ObjectId(userId),
                        isPublished : true
                    }
                })
            }

            if(query.videoId){
                matchCondition.push({
                    $match: {
                        _id: new mongoose.Types.ObjectId(query.videoId),
                    },
                })
                matchCondition.push({
                    $addFields:{
                        videoFile: "$videoFile.url",
                        thumbnail: "$thumbnail.url",
                    }
                })
            }

            let find = [
                    ...matchCondition,
                {
                    $lookup:{
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner',
                        pipeline:[
                            {
                                $project:{
                                    username: 1,
                                    email: 1,
                                    avatar: 1,
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ];
            let result = await Video.aggregate(find);
            let totalPage = Math.ceil(result.length / perPage);
            let finalResult = await Video.aggregate([...find, {$skip: skip}, {$limit: perPage}]);
            return {
                totalCount: result.length,
                totalPage,
                pageNo: pageNo,
                result: finalResult
            }
        }catch(err) {
            return err;
        }
    };
}

module.exports = new VideoServices();