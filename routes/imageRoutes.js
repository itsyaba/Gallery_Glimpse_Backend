import express from "express";
// import imageController from "../controllers/imageController.js";
import imageController from "../controllers/imageController.js";
import userController from "../controllers/userController.js";

const router = express.Router();
// PINS === IMAGES

router
  .route("/")
  .get(imageController.getAllPins)
  .post(userController.protector, imageController.uploadPinImage, imageController.createNewPin);

router.route("/search/:searchTerm").get(imageController.searchPin);
router.route("/mypins").get(userController.protector, imageController.getMyPrivatePin);

router
  .route("/:id")
  .get(imageController.getPinDetail)
  .patch(imageController.updatePinDetail)
  .delete(imageController.deletePin);

router.route("/createdBy/:id").get(imageController.getPinsCreatedByUserId);

router.route("/category/:categoryName").get(imageController.getSimilarImage);

export default router;
