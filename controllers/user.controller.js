import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { AsyncError, sendSuccess } from "../middleware/responseHandler.js";
import { sendOTP } from "../utility/sendOTP.js";

export const UserController = {


  registerNewUser: AsyncError(async (req, res) => {
    const { email, name, mobile } = req.body;

    if (!name || !mobile) {
      const err = new Error("name and mobile are required");
      err.statusCode = 404;
      throw err;
    }

    // Check existing user
    const existingUser = await User.findOne({ mobile: mobile.trim() });

    if (existingUser) {
      if (!existingUser.is_phone_verified) {
        // const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp = "1234";
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        existingUser.otp = otp;
        existingUser.otp_expiry = otpExpiry;

        const now = new Date();
        existingUser.otp_token_generated_at = now;
        await existingUser.save();

        const otp_token = jwt.sign(
          { id: existingUser._id, issued_at: now.getTime() }, // store timestamp
          process.env.JWT_OTP_SECRET,
          { expiresIn: "5m" }
        );

        await sendOTP(existingUser.mobile, otp);

        return sendSuccess(
          res,
          { otp_token },
          "OTP resent successfully. Please verify to complete registration.",
          200
        );
      }
      const err = new Error("User already exists.");
      err.statusCode = 400;
      throw err;
    }

    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = "1234";
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    const user = await User.create({
      name,
      email: email?.trim() || "",
      mobile: mobile.trim(),
      otp,
      otp_expiry: otpExpiry,
      is_phone_verified: false,
    });

    const now = new Date();
    user.otp_token_generated_at = now;
    await user.save();

    const otp_token = jwt.sign(
      { id: user._id, issued_at: now.getTime() }, // store timestamp
      process.env.JWT_OTP_SECRET,
      { expiresIn: "5m" }
    );

    await sendOTP(mobile.trim(), otp);

    return sendSuccess(
      res,
      { otp_token },
      "OTP sent successfully. Please verify to complete registration.",
      201
    );
  }),

  login: AsyncError(async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
      const err = new Error("number is required");
      err.statusCode = 400;
      throw err;
    }

    const userInfo = await User.findOne({ mobile: mobile.trim() });

    if (!userInfo) {
      const err = new Error("user not found! please register first");
      err.statusCode = 404;
      throw err;
    }
    const otp = "1234";
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    userInfo.otp = otp;
    userInfo.otp_expiry = otpExpiry;

    const now = new Date();
    userInfo.otp_token_generated_at = now;
    await userInfo.save();

    const otp_token = jwt.sign(
      { id: userInfo._id, issued_at: now.getTime() },
      process.env.JWT_OTP_SECRET,
      { expiresIn: "5m" }
    );

    await sendOTP(userInfo.mobile, otp);

    return sendSuccess(
      res,
      { otp_token },
      "OTP sent successfully. Please verify to login.",
      201
    );
  }),

  verifyOTP: AsyncError(async (req, res) => {
    const { otp, otp_token } = req.body;

    if (!otp || !otp_token) {
      const err = new Error("OTP is required");
      err.statusCode = 400;
      throw err;
    }

    // Verify OTP token first
    let decoded;
    try {
      decoded = jwt.verify(otp_token, process.env.JWT_OTP_SECRET);
    } catch (e) {
      const err = new Error("Invalid or expired OTP token");
      err.statusCode = 401;
      throw err;
    }

    // Find the user by ID from token
    const user = await User.findById(decoded.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    // console.log(decoded);

    if (
      !decoded.issued_at ||
      !user.otp_token_generated_at ||
      decoded.issued_at < user.otp_token_generated_at.getTime()
    ) {
      const err = new Error(" OTP token has been invalidated. Please request a new OTP.");
      err.statusCode = 401;
      throw err;
    }

    // Validate OTP
    if (!user.otp || user.otp_expiry < new Date()) {
      user.otp = "";
      user.otp_expiry = null;
      await user.save();

      const err = new Error("OTP has expired. Please request a new OTP.");
      err.statusCode = 400;
      throw err;
    }

    if (user.otp !== otp) {
      const err = new Error("Invalid OTP. Please try again.");
      err.statusCode = 400;
      throw err;
    }

    // Clear OTP
    user.otp = "";
    user.otp_expiry = null;
    user.is_phone_verified = true;
    await user.save();

    user.last_token_generated_at = new Date();

    const payload = {
      id: user._id,
      email: user.email,
      issued_at: user.last_token_generated_at.getTime(),
    };

    const accessToken = jwt.sign(
      { ...payload, type: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    user.refresh_token = refreshToken;
    await user.save();

    const data = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    return sendSuccess(res, data, "OTP verified successfully", 201);
  }),

  resendOTP: AsyncError(async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
      const err = new Error("number is required");
      err.statusCode = 400;
      throw err;
    }

    // Find the user
    const user = await User.findOne({ mobile: mobile.trim() });
    if (!user) {
      const err = new Error("user not found! please register first");
      err.statusCode = 404;
      throw err;
    }

    // Generate new OTP and expiry
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = "1234";
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP
    user.otp = otp;
    user.otp_expiry = otpExpiry;
    const now = new Date();
    user.otp_token_generated_at = now;
    await user.save();

    const otp_token = jwt.sign(
      { id: user._id, issued_at: now.getTime() }, // store timestamp
      process.env.JWT_OTP_SECRET,
      { expiresIn: "5m" }
    );

    await sendOTP(mobile.trim(), otp);
    return sendSuccess(res, { otp_token }, "OTP sent successfully.", 201);
  }),

  generateAccessTokenFromRefreshToken: AsyncError(async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      const err = new Error("You are unauthorized!");
      err.statusCode = 400;
      throw err;
    }

    // Find user with this refresh token
    const user = await User.findOne({ refresh_token });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    // Verify refresh token
    try {
      jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      const err = new Error("Invalid or expired refresh token");
      err.statusCode = 403;
      throw err;
    }

    user.last_token_generated_at = new Date();

    const payload = {
      id: user._id,
      email: user.email,
      issued_at: user.last_token_generated_at.getTime(),
    };

    const accessToken = jwt.sign(
      { ...payload, type: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const data = { access_token: accessToken };
    return sendSuccess(res, data, "token generated successfully", 200);
  }),

  getProfile: AsyncError(async (req, res) => {
    const user = await User.findById(req.user.id);

    const userInfo = {
      name: user.name,
      _id: user._id,
      email: user.email,
      mobile: user.mobile,
      image: user.image,
      is_phone_verified: user.is_phone_verified,
      createdAt: user.createdAt,
    };

    return sendSuccess(
      res,
      userInfo,
      "Profile details fetched successfully",
      200
    );
  }),

  updateProfile: AsyncError(async (req, res) => {
    const { name, image } = req.body;

    const userInfo = await User.findById(req.user.id);

    if (name) {
      userInfo.name = name.trim();
    }
    if (image) {
      userInfo.image = image.trim();
    }

    await userInfo.save();
    return sendSuccess(res, {}, "Profile updated successfully", 201);
  }),

  userList: AsyncError(async (req, res) => {
    const user = await User.find().sort({ createdAt: -1 });

    const users = user.map((user) => ({
      name: user.name,
      _id: user._id,
      email: user.email,
      mobile: user.mobile,
      image: user.image,
      status: user.status,
      is_phone_verified: user.is_phone_verified,
      createdAt: user.createdAt,
    }));

    return sendSuccess(res, users, "User list fetched successfully");
  }),

  userDelete: AsyncError(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return sendSuccess(res, {}, "User deleted successfully");
  }),

  userUpdate: AsyncError(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, req.body, { new: true });
    return sendSuccess(res, {}, "User updated successfully", 201);
  }),
};
