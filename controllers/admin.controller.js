import bcrypt from "bcrypt";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { AsyncError, sendSuccess } from "../middleware/responseHandler.js";

export const AdminController = {

  registerAdmin: AsyncError(async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      const err = new Error("Name, Password, Email are required");
      err.statusCode = 400;
      throw err;
    }
    const queryArr = [{ email: email.trim() }];

    const existingAdmin = await Admin.findOne({ $or: queryArr });
    if (existingAdmin) {
      return res.status(400).send({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email: email.trim(),
      email: email?.trim() || null,
      password: hashedPassword,
    });

    if (!newAdmin) {
      throw new Error("Admin not created");
    }

    const payload = { id: newAdmin._id, email: newAdmin.email };

    const accessToken = jwt.sign(
      { ...payload, type: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    newAdmin.refresh_token = refreshToken;
    await newAdmin.save();

    const data = { access_token: accessToken, refresh_token: refreshToken };
    return sendSuccess(res, data, "Admin registered successfully", 201);
  }),

  generateAccessTokenFromRefreshToken: AsyncError(async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      const err = new Error("Refresh token is required");
      err.statusCode = 400;
      throw err;
    }

    const token = await Admin.findOne({ refresh_token });
    if (!token) {
      const err = new Error("Invalid refresh token");
      err.statusCode = 403;
      throw err;
    }

    // Verify refresh token
    try {
      jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      const err = new Error("Refresh token expired or invalid");
      err.statusCode = 403;
      throw err;
    }

    token.last_token_generated_at = new Date();
    const payload = {
      id: token._id,
      email: token.email,
      issued_at: token.last_token_generated_at.getTime(),
    };

    const accessToken = jwt.sign(
      { ...payload, type: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );


    const data = { access_token: accessToken };
    return sendSuccess(res, data, "Access token generated successfully", 200);
  }),

  login: AsyncError(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Email and Password are required");
      err.statusCode = 400;
      throw err;
    }

    const AdminInfo = await Admin.findOne({ email: email.trim() });
    if (!AdminInfo) {
      const err = new Error("Invalid number or password");
      err.statusCode = 404;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, AdminInfo.password);
    if (!isPasswordValid) {
      const err = new Error("Invalid number or password");
      err.statusCode = 404;
      throw err;
    }

    AdminInfo.last_token_generated_at = new Date();
    const payload = {
      id: AdminInfo._id,
      email: AdminInfo.email,
      issued_at: AdminInfo.last_token_generated_at.getTime(),
    };

    const accessToken = jwt.sign(
      { ...payload, type: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Save refresh token in DB
    AdminInfo.refresh_token = refreshToken;
    await AdminInfo.save();

    const data = { access_token: accessToken, refresh_token: refreshToken };
    return sendSuccess(res, data, "Login successfully", 201);
  }),

}
