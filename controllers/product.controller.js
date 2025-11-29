import { AsyncError, sendSuccess } from "../middleware/responseHandler.js";
import { Collection } from "../models/collection.model.js";
import { Product } from "../models/product.modle.js";
import { Flavour, Weight } from "../models/ProductAttribute.model.js";

export const productController = {

  flavourAdd: AsyncError(async (req, res) => {
    const { name } = req.body;

    if (!name) {
      const err = new Error("name is required");
      err.statusCode = 400;
      throw err;
    }

    await Flavour.create(req.body);
    return sendSuccess(res, {}, "Flavour added successfully", 201);
  }),

  flavourList: AsyncError(async (req, res) => {
    const flavour = await Flavour.find({ isActive: true }).sort({ createdAt: -1 });
    if (!flavour) {
      const err = new Error("Flavour not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, flavour, "flavour list fetched successfully");
  }),

  weightAdd: AsyncError(async (req, res) => {
    const { label } = req.body;

    if (!label) {
      const err = new Error("label is required");
      err.statusCode = 400;
      throw err;
    }

    await Weight.create(req.body);
    return sendSuccess(res, {}, "weight added successfully", 201);
  }),

  weightList: AsyncError(async (req, res) => {
    const weight = await Weight.find({ isActive: true }).sort({ createdAt: -1 });
    if (!weight) {
      const err = new Error("not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, weight, "weight list fetched successfully");
  }),




  // Product Controllers
  addProduct: AsyncError(async (req, res) => {
    const {
      productName,
      description,
      categoryId,
      collectionId,
      orderType,
      variants,
      simplePrice,
      careInstructions,
      isCake,
      isNewest,
      isActive,
      dietaryType,
    } = req.body;

    // 1️⃣ BASIC REQUIRED FIELDS
    if (!productName || !categoryId || !orderType) {

      const err = new Error("Product name, category and order type are required.");
      err.statusCode = 400;
      throw err;
    }

    // 🧠 Convert booleans from "true"/"false" strings (FormData)
    const isCakeBool = isCake === "true" || isCake === true;
    const isNewestBool = isNewest === "true" || isNewest === true;
    const isActiveBool = isActive === "false" ? false : true; // default true

    // 2️⃣ IMAGES (from multer)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => `/uploads/products/${file.filename}`);
    }

    // 3️⃣ careInstructions (array of strings)
    let parsedCare = [];
    if (careInstructions) {
      parsedCare =
        typeof careInstructions === "string"
          ? JSON.parse(careInstructions)
          : careInstructions;
    }

    // 5️⃣ CAKE VARIANTS
    let parsedVariants = [];
    let parsedSimplePrice = null;

    if (isCakeBool) {
      if (!variants) {
        const err = new Error("Variants are required for cake products.");
        err.statusCode = 400;
        throw err;
      }

      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;

      // Basic structure validation
      for (const variant of parsedVariants) {
        if (!variant.flavour || !Array.isArray(variant.options)) {

          const err = new Error("Each variant must contain flavour and options");
          err.statusCode = 400;
          throw err;
        }

        for (const opt of variant.options) {
          if (!opt.weight || opt.regularPrice == null) {
            const err = new Error("Each option must have weight and regularPrice for cake products.");
            err.statusCode = 400;
            throw err;
          }
        }
      }
    } else {
      // 6️⃣ NON-CAKE PRICE (simplePrice)
      if (!simplePrice) {
        const err = new Error("simplePrice is required for non-cake products.");
        err.statusCode = 400;
        throw err;
      }

      parsedSimplePrice =
        typeof simplePrice === "string" ? JSON.parse(simplePrice) : simplePrice;

      if (parsedSimplePrice.regularPrice == null) {
        const err = new Error("regularPrice is required.");
        err.statusCode = 400;
        throw err;
      }
    }

    // 7️⃣ CREATE PRODUCT (all payloads included)
    await Product.create({
      productName,
      description,
      categoryId,
      collectionId,
      orderType,
      isCake: isCakeBool,

      images: imageUrls,

      variants: isCakeBool ? parsedVariants : [],
      simplePrice: isCakeBool ? null : parsedSimplePrice,

      careInstructions: parsedCare,

      isNewest: isNewestBool,
      isActive: isActiveBool,
      dietaryType,
    });

    return sendSuccess(res, {}, "Product added successfully", 201);
  }),

  productList: AsyncError(async (req, res) => {
    const { categoryId, collectionId } = req.body;

    const filter = { isActive: true };
    if (categoryId) filter.categoryId = categoryId;
    else if (collectionId) filter.collectionId = collectionId;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("categoryId", "name")
      .populate("collectionId", "name");

    const formattedProducts = products.map((p) => {
      // 1️⃣ CAKE PRODUCT → get first available option
      const firstCakeVariant = p.variants?.[0]?.options?.[0];

      // 2️⃣ NON-CAKE PRODUCT
      const simplePrice = p.simplePrice || null;

      const image = p.images?.[0] || null;

      const price = firstCakeVariant
        ? {
          regularPrice: firstCakeVariant.regularPrice,
          egglessPrice: firstCakeVariant.egglessPrice,
        }
        : simplePrice
          ? {
            regularPrice: simplePrice.regularPrice,
            egglessPrice: simplePrice.egglessPrice || null,
          }
          : null;

      return {
        productId: p._id,
        productName: p.productName,
        image,
        price,
        ...(categoryId
          ? {
            categoryId: p.categoryId?._id,
            categoryName: p.categoryId?.name || "",
          }
          : {
            collectionId: p.collectionId?._id,
            collectionName: p.collectionId?.name || "",
          }),
      };
    });

    return sendSuccess(res, formattedProducts, "Product list fetched successfully");
  }),

  productDetail: AsyncError(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, isActive: true })
      .populate({
        path: "variants.flavour",
        select: "name",
      })
      .populate({
        path: "variants.options.weight",
        select: "label",
      });

    if (!product) {
      return sendSuccess(res, {}, "Product not found");
    }

    // FORMAT CAKE VARIANTS
    const formattedVariants = product.variants?.map((v) => ({
      flavour: v.flavour?.name || null,
      options: v.options?.map((opt) => ({
        weight: opt.weight?.label || null,
        regularPrice: opt.regularPrice,
        egglessPrice: opt.egglessPrice,
      })),
    }));

    //  NON CAKE
    const simplePrice = product.simplePrice
      ? {
        regularPrice: product.simplePrice.regularPrice,
        egglessPrice: product.simplePrice.egglessPrice || null,
      }
      : null;

    const formattedProduct = {
      productId: product._id,
      productName: product.productName,
      description: product.description,
      category: product.categoryId,
      collection: product.collectionId,
      orderType: product.orderType,
      images: product.images,
      isCake: product.isCake,
      variants: formattedVariants,
      simplePrice,
      careInstructions: product.careInstructions || [],
      dietaryType: product.dietaryType,
      isNewest: product.isNewest,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return sendSuccess(
      res,
      formattedProduct,
      "Product details fetched successfully"
    );
  }),

  randomProductList: AsyncError(async (req, res) => {
    const allCollections = await Collection.find({ isActive: true });

    if (!allCollections.length) {
      return sendSuccess(res, [], "No active collections found");
    }

    const shuffled = allCollections.sort(() => 0.5 - Math.random());
    const selectedCollections = shuffled.slice(0, 2);

    const data = await Promise.all(
      selectedCollections.map(async (collection) => {
        const products = await Product.aggregate([
          {
            $match: {
              collectionId: collection._id,
              isActive: true,
            },
          },
          { $sample: { size: 10 } },
          {
            $project: {
              productId: "$_id",
              productName: 1,
              images: 1,
              isCake: 1,
              variants: 1,
              simplePrice: 1,
            },
          },
        ]);

        const formattedProducts = products.map((p) => {
          const firstVariant = p.variants?.[0];
          const firstOption = firstVariant?.options?.[0];

          const price = firstOption
            ? {
              regularPrice: firstOption.regularPrice,
              egglessPrice: firstOption.egglessPrice,
            }
            : p.simplePrice
              ? {
                regularPrice: p.simplePrice.regularPrice,
                egglessPrice: p.simplePrice.egglessPrice || null,
              }
              : null;

          return {
            productId: p.productId,
            productName: p.productName,
            image: p.images?.[0] || null,
            price,
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

    return sendSuccess(
      res,
      data,
      "Random product collections fetched successfully"
    );
  }),

  allProductList: AsyncError(async (req, res) => {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate("categoryId", "name")
      .populate("collectionId", "name")
      .select("productName categoryId collectionId images isNewest");

    const formattedProducts = products.map((p) => ({
      productId: p._id,
      isNewest: p.isNewest,
      productName: p.productName,
      image: p.images?.[0] || null,
      categoryName: p.categoryId?.name,
      collectionName: p.collectionId?.name,
    }));

    return sendSuccess(res, formattedProducts, "All product list fetched successfully");
  }),

  productDelete: AsyncError(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      const err = new Error("product not found");
      err.statusCode = 404;
      throw err;
    }
    return sendSuccess(res, {}, "Product deleted successfully", 201);
  })






};
