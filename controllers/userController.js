import User from "../models/userModel.js";
import Image from "../models/imageModel.js";
import asyncHandler from "express-async-handler";
import AppError from "../middleware/errorMiddleware.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const protector = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError("You are not logged in! Please log in to get access", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("The user belonging to this token does no longer exists", 401));

  req.user = currentUser;
  next();
});

const registerUser = asyncHandler(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  createSendToken(newUser, 201, req, res);
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && !password) return next(new AppError("Please provide email and password", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, req, res);
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");

  res.status(200).json({
    status: "Success",
    message: "Logged out successfully",
  });
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  }).select("+password");
  const updatedUser = await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError("User not found with id: " + req.params.id, 404));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  if (req.user._id.toHexString() !== req.params.id)
    return next(new AppError("Not authorized to delete this user", 401));

  const user = await User.findByIdAndDelete(req.user._id);
  const image = await Image.deleteMany({ createdBy: req.user._id });

  if (!user) return next(new AppError("User not found", 404));
  console.log(image);

  res.status(200).json({
    status: "success",
    message: "User Deleted Successfully",
  });
});

export default {
  protector,
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
  deleteUser,
};
