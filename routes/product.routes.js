import express from 'express';
import multer from 'multer';
import { AsyncError } from '../middleware/responseHandler.js';
import { Authentication } from '../middleware/auth.js';
import { productController } from '../controllers/product.controller.js';
import upload from '../utility/upload.js';
const router = express.Router();
const request_param = multer();



router.post(
  '/admin/flavour-add',
  request_param.any(),
  Authentication.admin(),
  AsyncError(productController.flavourAdd)
);

router.post(
  '/admin/weight-add',
  request_param.any(),
  Authentication.admin(),
  AsyncError(productController.weightAdd)
);

router.get(
  '/admin/flavour-list',
  Authentication.admin(),
  AsyncError(productController.flavourList)
);

router.get(
  '/admin/weight-list',
  Authentication.admin(),
  AsyncError(productController.weightList)
);


router.post(
  "/admin/product-add",
  Authentication.admin(),               // auth BEFORE upload
  (req, res, next) => {
    req.uploadFolder = "products";      // dynamic folder
    next();
  },
  upload.array("images", 3),            // max 3 files
  AsyncError(productController.addProduct)
);


router.post(
  "/user/product-list",
  request_param.any(),
  AsyncError(productController.productList)
);

router.get(
  "/user/product-detail/:productId",
  request_param.any(),
  AsyncError(productController.productDetail)
);

router.get(
  "/user/random-products",
  AsyncError(productController.randomProductList)
);
router.get(
  "/admin/product-list",
  Authentication.admin(),
  AsyncError(productController.allProductList)
);

export default router;