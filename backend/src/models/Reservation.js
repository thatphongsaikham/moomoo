import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    trim: true,
    default: "",
  },
  partySize: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  reservationTime: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true, // 15 minutes from reservation time
  },
  status: {
    type: String,
    enum: ["Active", "Converted", "Cancelled", "Expired"],
    default: "Active",
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    default: null, // Can assign to specific table or leave null for first available
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for active reservations
reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ customerPhone: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
