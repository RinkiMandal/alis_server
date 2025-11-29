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
  AsyncError(CategoryController.adminCategoryList)
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
  AsyncError(CategoryController.adminCollectionList)
);

router.get(
  "/user/collection",
  AsyncError(CategoryController.collectionList)
);

router.get(
  "/user/category-list",
  AsyncError(CategoryController.categoryList)
);


router.put(
  "/admin/collection-update/:id",
  Authentication.admin(),
  AsyncError(CategoryController.collectionUpdate)
);

router.put(
  "/admin/category-update/:id",
  Authentication.admin(),
  AsyncError(CategoryController.categoryUpdate)
);





// category collection delete routes
router.delete(
  "/admin/collection-delete/:id",
  Authentication.admin(),
  AsyncError(CategoryController.collectionDelete)
);

router.delete(
  "/admin/category-delete/:id",
  Authentication.admin(),
  AsyncError(CategoryController.categoryDelete)
);

export default router;
