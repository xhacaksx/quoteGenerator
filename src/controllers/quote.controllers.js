import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const subscribeQuote = asyncHandler(async (req, res) => {
  res.render("quote", {
    user: req.user,
  });
});

export { subscribeQuote };
