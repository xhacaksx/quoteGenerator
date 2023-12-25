import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { subscribeQuote } from "../controllers/quote.controllers.js";
const router = Router();

//router.route("/home").get(getAllBlog);
router.route("/").get(verifyJWT, subscribeQuote);
export default router;
