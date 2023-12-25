import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { setupCronJob } from "./controllers/sendEmail.js";
const app = express();
app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));
//middlewares

setupCronJob();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(cookieParser());
import userRouter from "./routes/user.routes.js";
import quoteRouter from "./routes/quote.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/quote", quoteRouter);
export { app };
