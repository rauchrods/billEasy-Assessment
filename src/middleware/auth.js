import jwt from "jsonwebtoken";

import { findById } from "../models/user.js";

export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token;

    // Check for token in cookie first
    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }
    // Then check Authorization header as fallback
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
