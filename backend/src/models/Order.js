import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    tableId: {
      type: String,
      required: true,
    },

    menuType: {
      type: String,
      enum: ["normal", "special"],
      required: true,
    },

    items: [
      {
        menuId: {
          type: String,
        },
        name: String,
        qty: Number,
        price: Number,
        note: {
          type: String,
          default: "",
        },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "delivered", "done"],
      default: "pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
