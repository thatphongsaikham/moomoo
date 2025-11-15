import mongoose from "mongoose";
import dotenv from "dotenv";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";

dotenv.config();

const verifySeed = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/moomoo";

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const tableCount = await Table.countDocuments();
    const menuItemCount = await MenuItem.countDocuments();

    console.log("\n📊 Database Status:");
    console.log(`   Tables: ${tableCount}/10`);
    console.log(`   Menu Items: ${menuItemCount}/16`);

    if (tableCount === 10 && menuItemCount === 16) {
      console.log("\n✅ Seed verification PASSED - All data present");
    } else {
      console.log("\n⚠️  Seed verification FAILED - Data incomplete");
      console.log("   Run: npm run seed");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
};

verifySeed();
