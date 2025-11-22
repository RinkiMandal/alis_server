import mongoose from "mongoose";

/* ---------------------- Flavour Schema ---------------------- */
const FlavourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

/* ---------------------- Weight Schema ---------------------- */
const WeightSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, unique: true }, // e.g., "1 Kg"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

/* ---------------------- Export Both Models ---------------------- */
export const Flavour = mongoose.model("Flavour", FlavourSchema);
export const Weight = mongoose.model("Weight", WeightSchema);
