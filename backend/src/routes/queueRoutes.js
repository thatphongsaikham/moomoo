import express from "express";
import {
  getAll,
  peek,
  enqueue,
  dequeue,
  remove,
  size,
} from "../controllers/queueController.js";

const router = express.Router();

// Public routes
router.get("/", getAll); // Get all queue entries
router.get("/next", peek); // Peek at next customer
router.get("/count", size); // Get queue size

// Admin routes (temporarily without auth for development)
router.post("/", enqueue); // Enqueue - Add customer to queue
router.post("/call-next", dequeue); // Dequeue - Call next customer (removes from queue)
router.delete("/:id", remove); // Remove specific customer from queue

export default router;
