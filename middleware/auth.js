import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";

export const Authentication = {
  admin: function () {
    return async function (req, res, next) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
          return res.status(401).send({
            success: false,
            message: "No token provided. Please login again.",
          });

        const token = authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : authHeader;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || decoded.type !== "access") {
          return res.status(401).send({
            success: false,
            message: "Invalid or expired access token. Please login again.",
          });
        }

        const admin = await Admin.findById(decoded.id);
        if (!admin)
          return res.status(401).send({
            success: false,
            message: "Admin not found. Please login again.",
          });

        if (
          !decoded.issued_at ||
          new Date(decoded.issued_at).getTime() <
            new Date(admin.last_token_generated_at).getTime()
        ) {
          return res.status(401).send({
            success: false,
            message: "Session invalidated. Please login again.",
          });
        }

        req.admin = {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        };

        next();
      } catch (error) {
        console.error("Auth error:", error);
        if (error.name === "TokenExpiredError") {
          return res.status(401).send({
            success: false,
            message: "Access token expired. Please refresh your session.",
          });
        }

        res.status(401).send({
          success: false,
          message: "Unauthorized. Please login again.",
        });
      }
    };
  },

  user: function () {
    return async function (req, res, next) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
          return res.status(401).send({
            success: false,
            message: "No token provided. Please login again.",
          });

        const token = authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : authHeader;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || decoded.type !== "access") {
          return res.status(401).send({
            success: false,
            message: "Invalid or expired access token. Please login again.",
          });
        }

        const user = await User.findById(decoded.id);
        if (!user)
          return res.status(401).send({
            success: false,
            message: "User not found. Please login again.",
          });

        if (
          !decoded.issued_at ||
          new Date(decoded.issued_at).getTime() <
            new Date(user.last_token_generated_at).getTime()
        ) {
          return res.status(401).send({
            success: false,
            message: "Session invalidated. Please login again.",
          });
        }

        req.user = {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
        };

        next();
      } catch (error) {
        console.error("Auth error:", error);
        if (error.name === "TokenExpiredError") {
          return res.status(401).send({
            success: false,
            message: "Access token expired. Please refresh your session.",
          });
        }

        res.status(401).send({
          success: false,
          message: "Unauthorized. Please login again.",
        });
      }
    };
  },
};
