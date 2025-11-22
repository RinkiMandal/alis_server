import { sendSuccess } from "../middleware/responseHandler.js";
import { Store } from "../models/store.model.js";

export const StoreController = {
  async storeAdd(req, res) {
    const { name, address, phone, email } = req.body;

    if (!name || !address || !phone || !email) {
      return res.status(400).send({
        success: false,
        message: "Name and address, phone, email are required",
      });
    }

    const data = await Store.create(req.body);
    return sendSuccess(res, data, "Store added successfully", 201);
  },

  async storeList(req, res) {
    const stores = await Store.find({ isActive: true }).sort({ createdAt: -1 });
    return sendSuccess(res, stores, "Store list fetched successfully");
  },

  async storeUpdate(req, res) {
    const { id } = req.params;
    const data = await Store.findByIdAndUpdate(id, req.body, { new: true });
    return sendSuccess(res, data, "Store updated successfully", 201);
  },

  async storeDelete(req, res) {
    const { id } = req.params;
     await Store.findByIdAndDelete(id);
    return sendSuccess(res, {}, "Store deleted successfully", 201);
  },
};
