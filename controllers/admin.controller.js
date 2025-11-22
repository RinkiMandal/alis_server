import bcrypt from "bcrypt";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { sendSuccess } from "../middleware/responseHandler.js";

export const AdminController = {
  async registerAdmin(req, res) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).send({
        success: false,
        message: "Name, Password, Email are required",
      });
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
  },

  async generateAccessTokenFromRefreshToken(req, res) {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).send({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Find Admin with this refresh token
    const token = await Admin.findOne({ refresh_token });
    if (!token) {
      return res.status(403).send({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Verify refresh token
    try {
      jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).send({
        success: false,
        message: "Refresh token expired or invalid",
      });
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
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .send({ success: false, message: "email and password are required" });

    const AdminInfo = await Admin.findOne({ email: email.trim() });
    if (!AdminInfo)
      return res
        .status(404)
        .send({ success: false, message: "Invalid number or password" });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, AdminInfo.password);
    if (!isPasswordValid)
      return res
        .status(400)
        .send({ success: false, message: "Invalid number or password" });

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
  },

  async profile(req, res) {
    const admin = await Admin.findById(req.admin.id);

    const userInfo = {
      name: admin.name,
      _id: admin._id,
      email: admin.email,
      createdAt: admin.createdAt,
    };

    return sendSuccess(res, userInfo, "Profile fetched successfully", 200);
  },

};
