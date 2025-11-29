import { AsyncError, sendSuccess } from "../middleware/responseHandler.js";
import { Category } from "../models/category.model.js";
import { Collection } from "../models/collection.model.js";

export const CategoryController = {

  // category controllers
  categoryAdd: AsyncError(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
      const err = new Error("name is required");
      err.statusCode = 400;
      throw err;
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    await Category.create({
      name,
      description,
      image: imageUrl,
    });

    return sendSuccess(res, {}, "Category added successfully", 201);
  }),

  categoryList: AsyncError(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    if (!categories) {
      const err = new Error("categories not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, categories, "Category list fetched successfully");
  }),

  adminCategoryList: AsyncError(async (req, res) => {
    const categories = await Category.find().sort({
      createdAt: -1,
    });
    if (!categories) {
      const err = new Error("categories not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, categories, "Category list fetched successfully");
  }),

  categoryUpdate: AsyncError(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updated) {
      const err = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    return sendSuccess(res, updated, "Status updated successfully");
  }),


  // Collection Controllers
  collectionAdd: AsyncError(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
      const err = new Error("name is required");
      err.statusCode = 400;
      throw err;
    }

    await Collection.create({ name, description });
    return sendSuccess(res, {}, "Collection added successfully", 201);
  }),

  collectionList: AsyncError(async (req, res) => {
    const categories = await Collection.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return sendSuccess(res, categories, "Collection list fetched successfully");
  }),

  adminCollectionList: AsyncError(async (req, res) => {
    const categories = await Collection.find().sort({
      createdAt: -1,
    });
    return sendSuccess(res, categories, "Collection list fetched successfully");
  }),

  collectionUpdate: AsyncError(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const updated = await Collection.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updated) {
      const err = new Error("Collection not found");
      err.statusCode = 404;
      throw err;
    }

    return sendSuccess(res, updated, "Status updated successfully");
  }),


  // delete controllers

  categoryDelete: AsyncError(async (req, res) => {
    const { id } = req.params;
    const product = await Category.findByIdAndDelete(id);

    if (!product) {
      const err = new Error("category not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, {}, "Category deleted successfully", 201);
  }),

  collectionDelete: AsyncError(async (req, res) => {
    const { id } = req.params;
    const product = await Collection.findByIdAndDelete(id);

    if (!product) {
      const err = new Error("Collection not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, {}, "Collection deleted successfully", 201);
  }),



};
