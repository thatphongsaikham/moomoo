import asyncHandler from "express-async-handler";
import QueueService from "../services/QueueService.js";

/**
 * @route   GET /api/queue
 * @desc    Get all queue entries (ordered by createdAt)
 * @access  Public
 */
export const getAll = asyncHandler(async (req, res) => {
  const queue = await QueueService.getAll();

  res.status(200).json({
    success: true,
    count: queue.length,
    data: queue,
  });
});

/**
 * @route   GET /api/queue/next
 * @desc    Get the next customer in queue (peek, doesn't remove)
 * @access  Public
 */
export const peek = asyncHandler(async (req, res) => {
  const next = await QueueService.peek();

  res.status(200).json({
    success: true,
    data: next,
  });
});

/**
 * @route   POST /api/queue
 * @desc    Add a customer to the queue (enqueue)
 * @access  Public
 * @body    { customerName, customerPhone?, partySize }
 */
export const enqueue = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, partySize } = req.body;

  const queue = await QueueService.enqueue({
    customerName,
    customerPhone,
    partySize,
  });

  res.status(201).json({
    success: true,
    message: "Added to queue successfully",
    data: queue,
  });
});

/**
 * @route   POST /api/queue/call-next
 * @desc    Call the next customer (dequeue - removes first from queue)
 * @access  Private (admin only)
 */
export const dequeue = asyncHandler(async (req, res) => {
  const called = await QueueService.dequeue();

  res.status(200).json({
    success: true,
    message: "Called next customer",
    data: called,
  });
});

/**
 * @route   DELETE /api/queue/:id
 * @desc    Remove a specific customer from queue
 * @access  Private (admin only)
 */
export const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const removed = await QueueService.remove(parseInt(id));

  res.status(200).json({
    success: true,
    message: "Removed from queue",
    data: removed,
  });
});

/**
 * @route   GET /api/queue/count
 * @desc    Get the number of customers in queue (size)
 * @access  Public
 */
export const size = asyncHandler(async (req, res) => {
  const count = await QueueService.size();

  res.status(200).json({
    success: true,
    data: { count },
  });
});
