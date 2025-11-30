import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    ref: "Table",
  },
  queueType: {
    type: String,
    enum: ["Normal", "Special"],
    required: true,
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      nameThai: {
        // Snapshot for deleted items
        type: String,
        required: true,
      },
      nameEnglish: {
        // Snapshot for deleted items
        type: String,
        required: true,
      },
      price: {
        // Snapshot for price changes
        type: Number,
        required: true,
        min: 0,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: "",
    maxlength: 500,
  },
  customerName: {
    type: String,
    default: "",
    maxlength: 100,
  },
});

// Indexes for FIFO queue processing
orderSchema.index({ queueType: 1, status: 1, createdAt: 1 }); // Primary queue index
orderSchema.index({ tableNumber: 1, status: 1, createdAt: -1 }); // Table order history

const Order = mongoose.model("Order", orderSchema);

export default Order;
