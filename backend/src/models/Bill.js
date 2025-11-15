import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    ref: "Table",
    index: true,
  },
  customerCount: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  buffetTier: {
    type: String,
    enum: ["Starter", "Premium"],
    required: true,
  },
  buffetPricePerPerson: {
    type: Number,
    required: true,
    min: 0,
  },
  buffetCharges: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function () {
        return (
          this.buffetCharges === this.customerCount * this.buffetPricePerPerson
        );
      },
      message: "Buffet charges must equal customerCount × buffetPricePerPerson",
    },
  },
  specialItems: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
      nameThai: {
        type: String,
        required: true,
      },
      nameEnglish: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      subtotal: {
        type: Number,
        required: true,
        min: 0,
        validate: {
          validator: function () {
            return this.subtotal === this.price * this.quantity;
          },
          message: "Subtotal must equal price × quantity",
        },
      },
    },
  ],
  specialItemsTotal: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function () {
        return this.total === this.buffetCharges + this.specialItemsTotal;
      },
      message: "Total must equal buffetCharges + specialItemsTotal",
    },
  },
  preVatSubtotal: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (v) => {
        const decimalPlaces = (v.toString().split(".")[1] || "").length;
        return decimalPlaces <= 2;
      },
      message: "Pre-VAT subtotal must have at most 2 decimal places",
    },
  },
  vatAmount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (v) => {
        const decimalPlaces = (v.toString().split(".")[1] || "").length;
        return decimalPlaces <= 2;
      },
      message: "VAT amount must have at most 2 decimal places",
    },
  },
  status: {
    type: String,
    enum: ["Active", "Archived"],
    default: "Active",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
});

// Indexes for bill queries
billSchema.index({ tableNumber: 1, status: 1 }); // Active bill for table
billSchema.index({ status: 1, archivedAt: -1 }); // Historical bill access
billSchema.index({ createdAt: -1 }); // Recent transactions

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
