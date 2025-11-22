import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const Schema = mongoose.Schema;

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },

  },
  { timestamps: true, versionKey: false }
);

CollectionSchema.plugin(mongooseAggregatePaginate);
export const Collection = mongoose.model("Collection", CollectionSchema);
