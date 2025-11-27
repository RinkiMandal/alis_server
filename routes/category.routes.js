import express from "express";
import multer from "multer";
import { AsyncError } from "../middleware/responseHandler.js";
import { Authentication } from "../middleware/auth.js";
import { CategoryController } from "../controllers/category.controller.js";
import upload from "../utility/upload.js";
const router = express.Router();
const request_param = multer();

router.post(
  "/admin/category-add",
  Authentication.admin(),
  (req, res, next) => {
    req.uploadFolder = "categories";
    next();
  },
  upload.single("image"),
  AsyncError(CategoryController.categoryAdd)
);



router.get(
  "/admin/category-list",
  Authentication.admin(),
  AsyncError(CategoryController.categoryList)
);

router.post(
  "/admin/collection-add",
  request_param.any(),
  Authentication.admin(),
  AsyncError(CategoryController.collectionAdd)
);

router.get(
  '/admin/collection',
  Authentication.admin(),
  AsyncError(CategoryController.collectionList)
);

router.get(
  "/user/collection",
  AsyncError(CategoryController.collectionList)
);

router.get(
  "/user/category-list",
  AsyncError(CategoryController.categoryList)
);

export default router;
