import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: "",
    maxlength: 500,
  },
});

// เมนูแต่ละรายการ (ใช้ collection menuitems)
const menuItemFullSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["Starter Buffet", "Premium Buffet", "Special Menu"],
  },
  nameThai: {
    type: String,
    required: true,
  },
  nameEnglish: {
    type: String,
    required: true,
  },
  descriptionThai: {
    type: String,
    default: "",
  },
  descriptionEnglish: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  availability: {
    type: String,
    default: "Available",
  },
  imageUrl: {
    type: String,
    default: "",
  },
});

const MenuItem = mongoose.model("MenuItem", menuItemFullSchema);

export default MenuItem;
