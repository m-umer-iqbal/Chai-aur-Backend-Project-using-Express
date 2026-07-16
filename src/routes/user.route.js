import { Router } from "express";
import { changeUserAvatar, changeUserCoverImage, changeUserInfo, changeUserPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import uploadOnServerByMulter from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
    uploadOnServerByMulter.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

userRouter.route("/login").post(loginUser);

// secured routes
userRouter.route("/logout").get(verifyJWT, logoutUser);
userRouter.route("/refresh-token").get(refreshAccessToken);
userRouter.route("/change-password").post(verifyJWT, changeUserPassword);
userRouter.route("/get-user").get(verifyJWT, getCurrentUser);
userRouter.route("/change-user-info").post(verifyJWT, changeUserInfo);
userRouter.route("/change-user-avatar").post(verifyJWT, uploadOnServerByMulter.single("avatar"), changeUserAvatar);
userRouter.route("/change-user-coverimage").post(verifyJWT, uploadOnServerByMulter.single("coverImage"), changeUserCoverImage);

export default userRouter;