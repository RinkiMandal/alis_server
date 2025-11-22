import { sendSuccess } from "../middleware/responseHandler.js";
import { Category } from "../models/category.model.js";
import { Collection } from "../models/collection.model.js";
import { saveFile } from "../services/fileUploadService.js";

export const CategoryController = {
  async categoryAdd(req, res) {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }

    let image = "";
    if (req.files && req.files.length > 0) {
      image = saveFile(req.files[0], "categories"); // Save locally for now
    }

    const data = await Category.create({
      name,
      description,
      image, // local path, e.g. /uploads/categories/image-123.png
    });

    return sendSuccess(res, data, "Category added successfully", 201);
  },

  async categoryList(req, res) {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    if (!categories) {
      return sendSuccess(res, [], "Category list fetched successfully");
    }
    return sendSuccess(res, categories, "Category list fetched successfully");
  },

  async collectionAdd(req, res) {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }

    const data = await Collection.create({ name, description });
    return sendSuccess(res, data, "Collection added successfully", 201);
  },

  async collectionList(req, res) {
    const categories = await Collection.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return sendSuccess(res, categories, "Collection list fetched successfully");
  },
};
