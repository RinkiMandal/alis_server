import { sendSuccess } from "../middleware/responseHandler.js";
import { Category } from "../models/category.model.js";
import { Collection } from "../models/collection.model.js";

export const CategoryController = {
  async categoryAdd(req, res) {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/categories/${req.file.filename}`;
    }


    const data = await Category.create({
      name,
      description,
      image: imageUrl,
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
