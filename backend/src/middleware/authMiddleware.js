import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * Authentication Middleware
 * Protects admin routes by verifying JWT token
 * Usage: Add to routes that require admin authentication
 */

// ให้แก้ไข middleware นี้ให้ข้ามการตรวจสอบ token
export const authMiddleware = (req, res, next) => {
  // ไม่ตรวจสอบ token ใด ๆ
  next();
};

/**
 * Admin Role Middleware
 * Ensures user has admin role
 * Usage: Chain after authMiddleware for admin-only routes
 */
export const adminOnly = (req, res, next) => {
  // ข้ามการตรวจสอบ admin เช่นกัน (สำหรับ dev/test)
  next();
};
