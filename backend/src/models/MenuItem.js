import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Starter Buffet", "Premium Buffet", "Special Menu"],
    required: true,
  },
  nameThai: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  nameEnglish: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  descriptionThai: {
    type: String,
    default: "",
    maxlength: 500,
  },
  descriptionEnglish: {
    type: String,
    default: "",
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (v) => Number.isInteger(v * 100), // Ensure 2 decimal max
      message: "Price must have at most 2 decimal places",
    },
  },
  availability: {
    type: String,
    enum: ["Available", "Out of Stock"],
    default: "Available",
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for query performance
menuItemSchema.index({ category: 1, availability: 1, nameThai: 1 }); // Customer menu filtering
menuItemSchema.index({ availability: 1, updatedAt: -1 }); // Admin inventory management

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
