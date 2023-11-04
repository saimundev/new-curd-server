import express from "express";
import cors from "cors";
import * as dotenv from 'dotenv'

import authRoute from "./routes/authRoute.js"
import dbConnect from "./models/db.js";
import userRouter from "./routes/userRoute.js"

//init app 
const app = express();

//env confige
dotenv.config()

//DB connect
dbConnect();

//port
const port = process.env.PORT || 5050

//middleware
app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth/", authRoute)
app.use("/api/user/", userRouter)

//server
app.listen(port, () => {
    console.log("server is raning oh the port is 5050");
})