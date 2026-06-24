import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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

userRouter.route("/login").get(loginUser); 

// secured routes
userRouter.route("/logout").get(verifyJWT, logoutUser);

export default userRouter;