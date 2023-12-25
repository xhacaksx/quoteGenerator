import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //object ke andar aagya
    user.refreshToken = refreshToken;

    //bina validate ke andar dalo warna model pura follow karne padega
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens!");
  }
};
const getRegisterUser = asyncHandler(async (req, res) => {
  return res.render("register");
});

const getLoginUser = asyncHandler(async (req, res) => {
  return res.render("login");
});
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation -- not empty (aur bhi de sakte)
  //check if user already existed:username , email
  //check for images , check for avatar
  //upload them to cloudinary,avatar
  //create user object: mongodb mei bhejna
  //create entry in db
  //remove password and refresh token from field from response
  //check for user creation
  //return response

  //form or json se arha th body mei aajeyga
  const { fullName, email, username, password } = req.body;
  //if (fullName === "") throw new ApiError(400, "FullName is required!");

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "FullName is required!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(401, "User with email or username already exists!");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  async function sendMail() {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "smartakshat007@gmail.com",
        pass: "hzxkwbcodtozhjgm",
      },
    });

    let message = {
      from: "smartakshat007@gmail.com", // sender address
      to: `${user.email}`, // list of receivers
      subject: "Registeration successful", // Subject line
      text: `Hello ${user.username}, you are successfully registered!`, // plain text body
    };

    transporter
      .sendMail(message)
      .then(() => {
        console.log("Email sent successfully!");
      })
      .catch((err) => {
        console.log(err);
      });
  }
  sendMail();
  return res.status(201).redirect("/api/v1/login");
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data

  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail) {
    throw new ApiError(400, "Username or email is required!");
  }
  //username or email

  //find karega ya toh username ya email mil jaye

  //find the user
  let user;
  const isEmail = usernameOrEmail.includes("@");
  if (isEmail) {
    // If it's an email, query by email
    user = await User.findOne({ email: usernameOrEmail });
  } else {
    // If it's a username, query by username
    user = await User.findOne({ username: usernameOrEmail });
  }
  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  //password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }
  //access and refresh token --generation
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  //send these tokens -- cookies

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //now only server can modify
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect("/api/v1/quote");
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .render("quote");
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingingRefreshToken) throw new ApiError(401, "unauthorized access");

  try {
    const decodedToken = jwt.verify(
      incomingingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "invalid refresh token");
    if (incomingingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used!");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  getRegisterUser,
  getLoginUser,
};
