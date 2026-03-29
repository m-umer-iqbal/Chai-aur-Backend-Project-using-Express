import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

userSchema.pre("save", async function () { // removed next from parameters 
    if (!this.isModified("password")) {
        // return next(); ❌ Old way — causes "next is not a function" with async in newer Mongoose
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
    //next(); ❌ Old way — causes "next is not a function" with async in newer Mongoose
    return;
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

const User = mongoose.model("User", userSchema);

export default User; 