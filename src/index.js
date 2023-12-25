import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Express server error:", error);
    });

    app.listen(process.env.PORT || 8040, () => {
      console.log(` Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed! ", err);
  });
