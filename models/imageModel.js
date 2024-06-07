import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    categories: {
      type: String,
      required: [true, "categories is required"],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;
