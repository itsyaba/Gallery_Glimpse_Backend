import asyncHandler from "express-async-handler";
import Image from "../models/imageModel.js";
import AppError from "../middleware/errorMiddleware.js";
import multer from "multer";

const multerStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/Images");
  },
  filename(req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `pins-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadPinImage = upload.single("image");

const createNewPin = asyncHandler(async (req, res, next) => {
  console.log(req.file);

  req.body.image = req.file.filename;
  req.body.createdBy = req.user._id;
  const { image, title, description, categories, isPublic, createdBy } = req.body;
  if (!image || !title || !description || !categories || !createdBy)
    return next(new AppError("Please provide all required fields", 400));

  console.log(req.body.image);

  const pinImage = await Image.create({
    image,
    title,
    description,
    categories,
    isPublic,
    createdBy,
  });

  await pinImage.save();

  res.status(201).json({
    status: "success",
    data: {
      pinImage,
    },
  });
});

const getAllPins = asyncHandler(async (req, res, next) => {
  const image = await Image.find({ isPublic: true });
  if (!image) return next(new AppError(`No Pins found`, 404));

  res.status(200).json({
    status: "Success",
    data: {
      image,
    },
  });
});

const getPinsCreatedByUserId = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const image = await Image.find({ createdBy: userId });

  if (!image) return next(new AppError("No Pins Found!", 404));

  res.status(200).json({
    status: "Success",
    data: {
      image,
    },
  });
});

const getSimilarImage = asyncHandler(async (req, res, next) => {
  const categoryName = req.params.categoryName;
  const image = await Image.find({ categories: categoryName });

  if (!image) return next(new AppError("Could Not Found Image!", 404));

  res.status(200).json({
    status: "Success",
    data: {
      image,
    },
  });
});

const getMyPrivatePin = asyncHandler(async (req, res, next) => {
  const image = await Image.find({ createdBy: req.user._id, isPublic: false });

  if (!image) return next(new AppError("No Pins Found", 404));

  res.status(200).json({
    status: "Success",
    data: {
      image,
    },
  });
});

const searchPin = asyncHandler(async (req, res, next) => {
  const search = req.params.searchTerm
    ? { title: { $regex: req.params.searchTerm, $options: "i" } }
    : {};

  if (!search) return next(new AppError("Please provide search term", 400));

  const image = await Image.find({ ...search });

  res.status(200).json({
    status: "Success",
    data: {
      image,
    },
  });
});

const getPinDetail = asyncHandler(async (req, res, next) => {
  const image = await Image.findOne({ _id: req.params.id });

  if (!image) return next(new AppError("Pin not found", 404));
  res.status(200).json({
    status: "Success",
    data: {
      image,
    },
  });
});

const updatePinDetail = asyncHandler(async (req, res, next) => {
  const image = await Image.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!image) return next(new AppError("Pin not found", 404));

  const updatedImage = await image.save();

  res.status(200).json({
    status: "Success",
    data: {
      image: updatedImage,
    },
  });
});

const deletePin = asyncHandler(async (req, res, next) => {
  const image = await Image.findByIdAndDelete(req.params.id);

  if (!image) return next(new AppError("Image Not Found", 404));

  res.status(200).json({
    status: "Success",
    message: "Pin Deleted SuccessFully",
  });
});

export default {
  createNewPin,
  getAllPins,
  getMyPrivatePin,
  searchPin,
  getPinDetail,
  getPinsCreatedByUserId,
  getSimilarImage,
  updatePinDetail,
  deletePin,
  uploadPinImage,
};
