import express from "express";
import multer from "multer";
import { Authentication } from "../middleware/auth.js";
import { AsyncError } from "../middleware/responseHandler.js";
import { UserController } from "../controllers/user.controller.js";
const router = express.Router();
const request_param = multer();

router.post(
  "/user/register",
  request_param.any(),
  AsyncError(UserController.registerNewUser)
);

router.post(
  "/user/generate-token",
  request_param.any(),
  AsyncError(UserController.generateAccessTokenFromRefreshToken)
);

router.post(
  "/user/verify-otp",
  request_param.any(),
  AsyncError(UserController.verifyOTP)
);

router.post(
  "/user/resend-otp",
  request_param.any(),
  AsyncError(UserController.resendOTP)
);

router.post(
  "/user/login",
  request_param.any(),
  AsyncError(UserController.login)
);

router.get(
  "/user/profile",
  Authentication.user(),
  AsyncError(UserController.getProfile)
);

router.patch(
  "/user/update-profile",
  request_param.any(),
  Authentication.user(),
  AsyncError(UserController.updateProfile) 
);


// Admin Routes

router.get(
  "/admin/user-list",
  Authentication.admin(),
  AsyncError(UserController.userList)
);

router.delete(
  "/admin/user-delete/:id",
  Authentication.admin(),
  AsyncError(UserController.userDelete)
);

router.patch(
  "/admin/user-update/:id",
  request_param.any(),
  Authentication.admin(),
  AsyncError(UserController.userUpdate)
);

export default router;
