import express from "express";
import {
  getAllMenuItems,
  getMenuByTier,
  getSpecialItems,
  getCategories,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";

const router = express.Router();

// GET routes
router.get("/", getAllMenuItems);
router.get("/tier/:tier", getMenuByTier);
router.get("/special", getSpecialItems);
router.get("/categories", getCategories);

// POST routes
router.post("/", addMenuItem);

// PUT routes
router.put("/:id", updateMenuItem);

// DELETE routes
router.delete("/:id", deleteMenuItem);

export default router;
