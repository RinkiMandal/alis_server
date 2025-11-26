import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const Schema = mongoose.Schema;

/**
 * 🟢 CAKE VARIANT STRUCTURE
 *
 * 1 Flavour → many weight options
 *
 * variants: [
 *   {
 *     flavour: ObjectId,
 *     options: [
 *       { weight: ObjectId, regularPrice, egglessPrice }
 *     ]
 *   }
 * ]
 */

const VariantOptionSchema = new Schema(
  {
    weight: {
      type: Schema.Types.ObjectId,
      ref: "Weight",
      required: true,
    },
    regularPrice: { type: Number, required: true },
    egglessPrice: { type: Number, required: true },
  },
  { _id: false }
);

const CakeVariantSchema = new Schema(
  {
    flavour: {
      type: Schema.Types.ObjectId,
      ref: "Flavour",
      required: true,
    },
    options: [VariantOptionSchema], // list of weights
  },
  { _id: false }
);

/**
 * 🟣 NON-CAKE PRICING
 * Simple fixed price
 */
const SimplePriceSchema = new Schema(
  {
    regularPrice: { type: Number, required: true },
    egglessPrice: { type: Number }, // non-cake may not need eggless
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    productName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    collectionId: { type: Schema.Types.ObjectId, ref: "Collection" },

    orderType: {
      type: String,
      enum: ["WhatsApp", "Website"],
      required: true,
    },

    /**
     * 🔥 DUAL SUPPORT
     * If product is cake: use variants[]
     * If product is simple: use simplePrice
     */
    isCake: { type: Boolean, default: false },

    variants: [CakeVariantSchema],     // Used ONLY IF isCake = true
    simplePrice: SimplePriceSchema,    // Used ONLY IF isCake = false

    /** Extra sections */
    careInstructions: [{ type: String, trim: true }],

    /** Product Images */
    images: {
      type: [String],
      trim: true,
      validate: {
        validator: function (v) {
          return !v || v.length <= 3;
        },
        message: "You can upload a maximum of 3 images.",
      },
    },

    /** Product tags */
    isNewest: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    dietaryType: {
      type: String,
      enum: ["Veg", "Egg", "Both"],
      default: "Both",
    },
  },
  { timestamps: true, versionKey: false }
);

/**
 * Auto extract unique flavour & weight list
 * (Only for cake)
 */
ProductSchema.pre("save", function (next) {
  if (this.isCake && this.variants?.length > 0) {
    const flavours = new Set();
    const weights = new Set();

    this.variants.forEach((variant) => {
      // flavour
      if (variant.flavour) flavours.add(variant.flavour.toString());

      // weight options
      variant.options?.forEach((opt) => {
        if (opt.weight) weights.add(opt.weight.toString());
      });
    });

    this.flavours = [...flavours];
    this.weights = [...weights];
  }

  // non-cake: clear
  if (!this.isCake) {
    this.flavours = [];
    this.weights = [];
  }

  next();
});

ProductSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", ProductSchema);
