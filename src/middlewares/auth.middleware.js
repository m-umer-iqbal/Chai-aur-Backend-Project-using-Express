import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log("request:", req);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRY);

        const foundedUser = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!foundedUser) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = foundedUser;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export default verifyJWT;