import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import jobRouter from "./routes/jobRouter.js"
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware} from "./middlewares/error.js";

// express node framework
const app=express();
// dotenv use for security
// here give path bcz it inside the folder file
dotenv.config({path: "./config/config.env"});
// -------------------middleware----------------------
// cors used to connect frontend and backend
// ---app.use(cors())----
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:['GET','POST','PUT','DELETE'],
    credentials:true,
})
);
app.use(cookieParser());
// use to parse only json data---
app.use(express.json());
// use to parse string value into json formate
app.use(express.urlencoded({extended:true }));
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/",
}))
// ===========routes===================
app.use("/user",userRouter);
app.use("/job",jobRouter)
app.use("/application",applicationRouter);

dbConnection();

// use middleware atlast line
app.use(errorMiddleware)

export default app;