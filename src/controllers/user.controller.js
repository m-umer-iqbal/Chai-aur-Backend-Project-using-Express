import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

// const generateAccessAndRefreshTokens = async (userId) => {
//     try {
//         const user = await User.findById(userId);

//         const accessToken = await user.generateAccessToken();
//         const refreshToken = await user.generateRefreshToken();

//         user.refreshToken = refreshToken;

//         await user.save({ ValiditeBeforeSave: false });

//         return { accessToken, refreshToken };
//     } catch (error) {
//         throw new ApiError(500, `Error in generating Access Token and Refresh Token: ${error.message}`);
//     }
// }

const generateAccessAndRefreshTokens = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ ValiditeBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, `Error in generating Access Token and Refresh Token: ${error.message}`);
    }
}

// Register User Function
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

// Login User Function
const loginUser = asyncHandler(async (req, res) => {
    // get user details form frontend username/email, password
    const { username, email, password } = req.body;

    // validation - not empty
    if (!username || username === "" || !email || email === "") {
        throw new ApiError(400, "Username or Email is required.");
    } else if (!password || password === "") {
        throw new ApiError(400, "Password is required.");
    }

    // check username/email ans password from the database
    const userExist = await User.findOne({
        $or: [{ username }, { email }] // find user by username or email
    });

    if (!userExist) {
        throw new ApiError(400, "User does not exist.");
    }

    const passwordCheck = await userExist.isPasswordCorrect(password);

    if (!passwordCheck) {
        throw new ApiError(400, "Password is incorrect.");
    }

    // check the access token, if new user then generate it
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userExist);

    // Update the user (Either can update the previously find User or find again the user which will be updated)

    // Method 1:
    userExist.refreshToken = refreshToken;
    userExist.accessToken = accessToken;
    userExist.save({ ValiditeBeforeSave: false })

    // Method 2:
    // const loggedInUser = await User.findById(userExist._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    // send successful response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "User logged in successfully", {
            user: userExist,
            accessToken,
            refreshToken
        }));
});

// Logout User Function
const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    });

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };