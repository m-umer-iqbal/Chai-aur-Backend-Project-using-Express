import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import uploadOnServerByMulter from "../middlewares/multer.middleware.js";

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

export default userRouter;