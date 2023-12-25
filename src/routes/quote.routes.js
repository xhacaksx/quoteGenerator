import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  subscribeQuote,
  subscribe,
  unsubscribe,
} from "../controllers/quote.controllers.js";
const router = Router();

//router.route("/home").get(getAllBlog);
router.route("/").get(verifyJWT, subscribeQuote);
router.route("/subscribe").post(verifyJWT, subscribe);
router.route("/unsubscribe").post(verifyJWT, unsubscribe);
export default router;
