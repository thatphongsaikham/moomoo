import express from "express";
import {
  createOrder,
  getOrders,
  completeOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.put("/:id/complete", completeOrder);
router.delete("/:id", deleteOrder);

export default router;
