import express from 'express';
import multer from 'multer';
import { AsyncError } from '../middleware/responseHandler.js';
import { Authentication } from '../middleware/auth.js';
import { StoreController } from '../controllers/store.controller.js';
const router = express.Router();
const request_param = multer();

router.get(
    '/user/store-list',
    AsyncError(StoreController.storeList)
);

router.get(
    '/admin/store-list',
    Authentication.admin(),
    AsyncError(StoreController.storeList)
);

router.delete(
    '/admin/store-delete/:id',
    Authentication.admin(),
    AsyncError(StoreController.storeDelete)
);

router.patch(
    '/admin/store-update/:id',
    Authentication.admin(),
    AsyncError(StoreController.storeUpdate)
);

router.post(
    '/admin/store-add',
    request_param.any(),
    Authentication.admin(),
    AsyncError(StoreController.storeAdd)
);


export default router;