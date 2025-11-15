import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * Authentication Middleware
 * Protects admin routes by verifying JWT token
 * Usage: Add to routes that require admin authentication
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User not found - token invalid");
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401);
      throw new Error("Not authorized - invalid token");
    }
  }

  // Check for token in cookies as fallback
  if (!token && req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User not found - token invalid");
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401);
      throw new Error("Not authorized - invalid token");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized - no token provided");
  }
});

/**
 * Admin Role Middleware
 * Ensures user has admin role
 * Usage: Chain after authMiddleware for admin-only routes
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized - admin access required");
  }
};
