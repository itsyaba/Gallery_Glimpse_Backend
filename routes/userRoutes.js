import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.route("/register").post(userController.registerUser);

router.route("/login").post(userController.loginUser);

router.route("/logout").get(userController.logoutUser);

router
  .route("/profile")
  .get(userController.protector, userController.getUserProfile)
  .patch(userController.protector, userController.updateUserProfile);

router
  .route("/:id")
  .get(userController.getUserById)
  .delete(userController.protector, userController.deleteUser);

export default router;
