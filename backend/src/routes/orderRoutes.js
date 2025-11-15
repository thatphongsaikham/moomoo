import express from "express";
import {
  createOrder,
  getOrders,
  completeOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.patch("/:id/complete", completeOrder);

export default router;
