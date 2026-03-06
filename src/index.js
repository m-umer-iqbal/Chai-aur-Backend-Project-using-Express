import dotenv from "dotenv";
import connectDB from "./db/connect.db";
import { app } from "./app";

dotenv.config({
    path: "./env"
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("App is listening on port:", process.env.PORT)
        })
    })
    .catch((error) => {
        console.log("MongoDB Connection Error in Index.js:", error)
    })