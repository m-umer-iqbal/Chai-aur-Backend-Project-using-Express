import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minLength: 8
    },
    refreshToken: {
        type: String,
    },
    watchHistory: [ // array of objectId
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);