import { sendSuccess } from "../middleware/responseHandler.js";
import { Collection } from "../models/collection.model.js";
import { Product } from "../models/product.modle.js";
import { Flavour, Weight } from "../models/ProductAttribute.model.js";
import { saveFile } from "../services/fileUploadService.js";

export const productController = {

  async flavourAdd(req, res) {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }

    const data = await Flavour.create(req.body);
    return sendSuccess(res, data, "Flavour added successfully", 201);
  },

  async weightAdd(req, res) {
    const { label } = req.body;

    if (!label) {
      return res.status(400).send({
        success: false,
        message: "label is required",
      });
    }

    const data = await Weight.create(req.body);
    return sendSuccess(res, data, "weight added successfully", 201);
  },

  async flavourList(req, res) {
    const flavour = await Flavour.find({ isActive: true }).sort({ createdAt: -1 });
    if (!flavour) {
      return sendSuccess(res, [], "flavour list fetched successfully");
    }
    return sendSuccess(res, flavour, "flavour list fetched successfully");
  },

  async weightList(req, res) {
    const weight = await Weight.find({ isActive: true }).sort({ createdAt: -1 });
    if (!weight) {
      return sendSuccess(res, [], "weight list fetched successfully");
    }
    return sendSuccess(res, weight, "weight list fetched successfully");
  },

  async addProduct(req, res) {
    const {
      productName,
      description,
      categoryId,
      collectionId,
      orderType,
      variants,
      careInstructions,
      manufactureDetails,
      isCake,
      isNewest,
      isActive,
      dietaryType,
    } = req.body;

    // ========= Validation =========
    if (!productName || !categoryId || !orderType) {
      return res.status(400).json({
        success: false,
        message: "Product name, category, and order type are required.",
      });
    }

    // ========= Parse variants =========
    let parsedVariants = [];
    if (variants) {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    // ========= Handle uploaded images =========
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => {
        return `/uploads/products/${file.filename}`;
      });
    }

    // ========= Create product =========
    const product = await Product.create({
      productName,
      description,
      categoryId,
      collectionId,
      orderType,
      variants: parsedVariants,
      careInstructions,
      manufactureDetails,
      images: imageUrls,
      isCake,
      isNewest,
      isActive,
      dietaryType,
    });

    return sendSuccess(res, product, "Product added successfully", 201);
  },


  async productList(req, res) {
    const { categoryId, collectionId } = req.body;

    // Build query dynamically
    const filter = { isActive: true };
    if (categoryId) filter.categoryId = categoryId;
    else if (collectionId) filter.collectionId = collectionId;

    // Fetch products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("categoryId", "name")
      .populate("collectionId", "name");

    // Format response data
    const formattedProducts = products.map((p) => {
      const firstVariant = p.variants?.[0];
      const firstPrice = firstVariant
        ? { regularPrice: firstVariant.regularPrice, egglessPrice: firstVariant.egglessPrice }
        : null;

      return {
        productId: p._id,
        productName: p.productName,
        image: p.images?.[0] || null, // ✅ first image
        ...(categoryId
          ? {
            categoryId: p.categoryId?._id,
            categoryName: p.categoryId?.name || "",
          }
          : {
            collectionId: p.collectionId?._id,
            collectionName: p.collectionId?.name || "",
          }),
        price: firstPrice,
      };
    });

    return sendSuccess(res, formattedProducts, "Product list fetched successfully");
  },

  async productDetail(req, res) {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, isActive: true })
      // .select("-flavours -weights")
      .populate({
        path: "variants.flavour",
        model: "Flavour",
        select: "name"
      })
      .populate({
        path: "variants.weight",
        model: "Weight",
        select: "label"
      })

    if (!product) {
      return sendSuccess(res, {}, "Product not found");
    }

    const formattedProduct = {
      ...product.toObject(),
      variants: product.variants.map((v) => ({
        flavour: v.flavour?.name || null,
        weight: v.weight?.label || null,
        regularPrice: v.regularPrice,
        egglessPrice: v.egglessPrice,
      })),
    };

    return sendSuccess(res, formattedProduct, "Product details fetched successfully");
  },


  async randomProductList(req, res) {
    const allCollections = await Collection.find({ isActive: true });

    if (allCollections.length === 0) {
      return sendSuccess(res, [], "No active collections found");
    }

    const shuffled = allCollections.sort(() => 0.5 - Math.random());
    const selectedCollections = shuffled.slice(0, 2);

    const data = await Promise.all(
      selectedCollections.map(async (collection) => {
        const products = await Product.aggregate([
          { $match: { collectionId: collection._id, isActive: true } },
          { $sample: { size: 10 } },
          {
            $project: {
              productId: "$_id",
              productName: 1,
              images: 1,
              variants: { $slice: ["$variants", 1] }, // only first variant
            },
          },
        ]);

        // If collection has no products, add placeholder empty products array
        const formattedProducts = products.map((p) => {
          const v = p.variants?.[0];
          return {
            productId: p.productId,
            productName: p.productName,
            image: p.images?.[0] || null,
            price: v
              ? { regularPrice: v.regularPrice, egglessPrice: v.egglessPrice }
              : null,
          };
        });

        return {
          collectionId: collection._id,
          collectionName: collection.name,
          description: collection.description || "",
          products: formattedProducts,
        };
      })
    );
    return sendSuccess(res, data, "Random product collections fetched successfully");
  },


  async allProductList(req, res) {
    // Fetch all active products
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate("categoryId", "name")
      .populate("collectionId", "name")
      .select("productName categoryId collectionId images isNewest"); // ✅ added images

    // Format response
    const formattedProducts = products.map((p) => ({
      productId: p._id,
      isNewest: p.isNewest,
      productName: p.productName,
      image: p.images?.[0] || null,
      categoryName: p.categoryId?.name || "Uncategorized",
      collectionName: p.collectionId?.name || "Unassigned",
    }));

    return sendSuccess(res, formattedProducts, "All product list fetched successfully");
  }





};
