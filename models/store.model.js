import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const Schema = mongoose.Schema;

const StoreSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

StoreSchema.plugin(mongooseAggregatePaginate);
export const Store = mongoose.model("Store", StoreSchema);
