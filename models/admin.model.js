import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: { type: String, minlength: 8 },
    refresh_token: { type: String, default: null },
    last_token_generated_at: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

AdminSchema.plugin(mongooseAggregatePaginate);
export const Admin = mongoose.model("Admin", AdminSchema);
