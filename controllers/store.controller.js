import { AsyncError, sendSuccess } from "../middleware/responseHandler.js";
import { Store } from "../models/store.model.js";

export const StoreController = {


  storeAdd: AsyncError(async (req, res) => {
    const { name, address, phone, email } = req.body;

    if (!name || !address || !phone || !email) {
      const err = new Error("All fields are required");
      err.statusCode = 404;
      throw err;
    }

    await Store.create(req.body);
    return sendSuccess(res, {}, "Store added successfully", 201);
  }),

  storeList: AsyncError(async (req, res) => {
    const stores = await Store.find({ isActive: true }).sort({ createdAt: -1 });
    if (!stores) {
      const err = new Error("Store not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, stores, "Store list fetched successfully");
  }),

  storeUpdate: AsyncError(async (req, res) => {
    const { id } = req.params;
    await Store.findByIdAndUpdate(id, req.body, { new: true });
    return sendSuccess(res, {}, "Store updated successfully", 201);
  }),

  storeDelete: AsyncError(async (req, res) => {
    const { id } = req.params;
    await Store.findByIdAndDelete(id);
    return sendSuccess(res, {}, "Store deleted successfully", 201);
  }),
};
