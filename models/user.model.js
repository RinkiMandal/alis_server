import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true, sparse: true, default: null },
    email: {
        type: String,
        trim: true,
        sparse: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    image: { type: String, default: '' },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'], index: true },
    refresh_token: { type: String, default: null }, 
    otp: { type: String, default: '' }, 
    otp_expiry: { type: Date, default: null },
    otp_token_generated_at: { type: Date, default: null },
    is_email_verified: { type: Boolean, default: false },
    is_phone_verified: { type: Boolean, default: false },
    last_token_generated_at: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

UserSchema.plugin(mongooseAggregatePaginate);
export const User = mongoose.model('User', UserSchema);
