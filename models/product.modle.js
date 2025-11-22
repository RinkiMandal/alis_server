import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const Schema = mongoose.Schema;

const VariantSchema = new Schema(
  {
    flavour: {
      type: Schema.Types.ObjectId,
      ref: "Flavour",
      required: false,
    },
    weight: {
      type: Schema.Types.ObjectId,
      ref: "Weight",
      required: false,
    },
    regularPrice: { type: Number, required: true },
    egglessPrice: { type: Number, required: true },
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
    variants: [VariantSchema],
    // flavours: [{ type: Schema.Types.ObjectId, ref: "Flavour" }],
    // weights: [{ type: Schema.Types.ObjectId, ref: "Weight" }],

    careInstructions: { type: String, trim: true },
    manufactureDetails: {
      manufacturedBy: { type: String, trim: true },
      address: { type: String, trim: true },
      fssaiLicense: { type: String, trim: true },
      customerSupport: {
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
      note: { type: String, trim: true },
    },

    images: {
      type: [String],
      trim: true,
      validate: {
        validator: function (v) {
          return !v || v.length <= 6;
        },
        message: "You can upload a maximum of 6 images.",
      },
    },

    // Boolean flags
    isCake: { type: Boolean, default: false },
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

// Automatically populate flavours[] and weights[] for UI filtering
ProductSchema.pre("save", function (next) {
  if (this.variants?.length > 0) {
    const flavourSet = new Set();
    const weightSet = new Set();

    this.variants.forEach((v) => {
      if (v.flavour) flavourSet.add(v.flavour.toString());
      if (v.weight) weightSet.add(v.weight.toString());
    });

    this.flavours = [...flavourSet];
    this.weights = [...weightSet];
  }
  next();
});

ProductSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", ProductSchema);
