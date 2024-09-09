const  mongoose = require('mongoose')

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            publicId: {
                type: String,
                required: true,
            },
            url: {
                type: String, //cloudinary url
                required: true,
            }

        },
        thumbnail: {
            publicId: {
                type: String,
                required: true,
            },
            url: {
                type: String, //cloudinary url
                required: true,
            }
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        duration: {
            type: Number,
        },
        views:{
            type: Number,
            default: 0,
        },
        isPublished:{
            type: Boolean,
            default: true,
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    },
    {
        timestamps: true,
        versionKey: false,
    });

module.exports = mongoose.model('videos', videoSchema);