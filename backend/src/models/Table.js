import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 10,
    immutable: true,
  },
  status: {
    type: String,
    enum: ["Available", "Reserved", "Open", "Closed"],
    default: "Available",
    required: true,
  },
  customerCount: {
    type: Number,
    min: 0,
    max: 4,
    default: 0,
    required: true,
  },
  buffetTier: {
    type: String,
    enum: ["None", "Starter", "Premium"],
    default: "None",
    required: true,
  },
  buffetPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  openedAt: {
    type: Date,
    default: null,
  },
  closedAt: {
    type: Date,
    default: null,
  },
  diningTimeRemaining: {
    type: Number, // milliseconds
    default: 5400000, // 90 minutes in ms
  },
  reservedAt: {
    type: Date,
    default: null,
  },
  reservationExpiresAt: {
    type: Date,
    default: null,
  },
  currentBill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    default: null,
  },
  pin: {
    type: String,
    default: null,
    minlength: 4,
    maxlength: 4,
  },
  encryptedId: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for query optimization (tableNumber already has unique index from schema)
tableSchema.index({ status: 1, reservationExpiresAt: 1 }); // For cron job auto-release
tableSchema.index({ status: 1, openedAt: 1 }); // For timer monitoring

const Table = mongoose.model("Table", tableSchema);

export default Table;
