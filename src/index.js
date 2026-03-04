import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/connect.db";

dotenv.config();

const app = express();

connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});