import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      trim: true,
      lowercase: true,
      validator: [validator.isEmail, "Please provide a valid email"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      trim: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);
// userSchema.virtual("image", {
//   ref: "Image",
//   localField: "_id",
//   foreignField: "createdBy",
// });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword, userPassword) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

userSchema.pre("remove", function (next) {
  this.model("Image").deleteMany({ createdBy: this._id }, next());
});

const User = mongoose.model("User", userSchema);

export default User;
