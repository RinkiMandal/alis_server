import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
 
CategorySchema.plugin(mongooseAggregatePaginate);
export const Category = mongoose.model("Category", CategorySchema);
