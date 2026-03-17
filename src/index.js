import dotenv from "dotenv";
import connectDB from "./db/connect.db.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env",
    quiet: true // remove .env logs from console
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