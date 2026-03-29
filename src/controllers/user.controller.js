import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { username, fullname, email, password } = req.body;

    // validation - not empty
    if (!username || username === "") {
        throw new ApiError(400, "Username is required.");
    } else if (!fullname || fullname === "") {
        throw new ApiError(400, "Fullname is required.");
    } else if (!email || email === "") {
        throw new ApiError(400, "Email is required.");
    } else if (!password || password === "") {
        throw new ApiError(400, "Password is required.");
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ email }, { username }] // checks if email or username match with any other email or username
    });
    console.log("Existed User: ", existedUser);
    if (existedUser) {
        throw new ApiError(409, "User already exist.");
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Before Cloudinary Avatar image is required.");
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "After Cloudinary Avatar image is required.");
    }

    // create user object – create entry in db
    const newUser = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || ""
    })

    // check for user creation
    const createdUser = await User.findById(newUser._id).select(
        "-password -refeshToken" // remove password and refresh token field from response
    );
    if (!createdUser) {
        throw new ApiError(500, "User not created.");
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    )
});

export { registerUser }