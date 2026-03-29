import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
    quiet: true
});

import connectDB from "./db/connect.db.js";
import { app } from "./app.js";

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("App is listening on port:", process.env.PORT)
        })
    })
    .catch((error) => {
        console.log("MongoDB Connection Error in Index.js:", error)
    })