import express from 'express';
import multer from 'multer';
import { AsyncError } from '../middleware/responseHandler.js';
import { AdminController } from '../controllers/admin.controller.js';
import { Authentication } from '../middleware/auth.js';
const router = express.Router();
const request_param = multer();

router.post(
    '/admin/register',
    request_param.any(),
    AsyncError(AdminController.registerAdmin)
);

router.post(
    '/admin/generate-token',
    request_param.any(),
    AsyncError(AdminController.generateAccessTokenFromRefreshToken)
);

router.post(
    '/admin/login',
    request_param.any(),
    AsyncError(AdminController.login)
);

router.get(
    '/admin/profile',
    Authentication.admin(),
    AsyncError(AdminController.profile)
);


export default router;