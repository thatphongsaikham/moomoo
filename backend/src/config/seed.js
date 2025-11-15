import mongoose from "mongoose";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";

/**
 * Database Seed Script
 * Purpose: Initialize 10 tables and sample menu items
 * Usage: node backend/src/config/seed.js
 * Requirements: FR-014 (10 tables), FR-018 (sample menu with categories)
 */

const seedTables = async () => {
  console.log("🌱 Seeding tables...");

  // Create 10 tables with default Available status
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    tables.push({
      tableNumber: i,
      status: "Available",
      customerCount: 0,
      buffetTier: "None",
      buffetPrice: 0,
      openedAt: null,
      closedAt: null,
      diningTimeRemaining: 5400000, // 90 minutes in ms
      reservedAt: null,
      reservationExpiresAt: null,
      currentBill: null,
      updatedAt: new Date(),
    });
  }

  await Table.deleteMany({}); // Clear existing tables
  await Table.insertMany(tables);

  console.log(`✅ Created ${tables.length} tables`);
};

const seedMenuItems = async () => {
  console.log("🌱 Seeding menu items...");

  const menuItems = [
    // Starter Buffet (Price: 0 - included in buffet)
    {
      category: "Starter Buffet",
      nameThai: "เนื้อหมูสไลด์",
      nameEnglish: "Sliced Pork",
      descriptionThai: "เนื้อหมูคุณภาพดีหั่นบางพร้อมทาน",
      descriptionEnglish: "Premium quality thinly sliced pork",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/pork-sliced.jpg",
    },
    {
      category: "Starter Buffet",
      nameThai: "เนื้อไก่สไลด์",
      nameEnglish: "Sliced Chicken",
      descriptionThai: "เนื้อไก่สดหั่นบางพร้อมทาน",
      descriptionEnglish: "Fresh thinly sliced chicken breast",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/chicken-sliced.jpg",
    },
    {
      category: "Starter Buffet",
      nameThai: "ผักรวม",
      nameEnglish: "Mixed Vegetables",
      descriptionThai: "ผักสดหลากหลายชนิด",
      descriptionEnglish: "Assorted fresh vegetables",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/vegetables.jpg",
    },
    {
      category: "Starter Buffet",
      nameThai: "เห็ดรวม",
      nameEnglish: "Mixed Mushrooms",
      descriptionThai: "เห็ดสดหลากหลายชนิด",
      descriptionEnglish: "Assorted fresh mushrooms",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/mushrooms.jpg",
    },
    {
      category: "Starter Buffet",
      nameThai: "ลูกชิ้นปลา",
      nameEnglish: "Fish Balls",
      descriptionThai: "ลูกชิ้นปลาทำสด",
      descriptionEnglish: "Fresh handmade fish balls",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/fish-balls.jpg",
    },

    // Premium Buffet (Price: 0 - included in buffet)
    {
      category: "Premium Buffet",
      nameThai: "เนื้อวากิว",
      nameEnglish: "Wagyu Beef",
      descriptionThai: "เนื้อวากิวเกรด A5 หั่นบาง",
      descriptionEnglish: "A5 grade Wagyu beef, thinly sliced",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/wagyu.jpg",
    },
    {
      category: "Premium Buffet",
      nameThai: "กุ้งแม่น้ำ",
      nameEnglish: "River Prawns",
      descriptionThai: "กุ้งแม่น้ำสดขนาดใหญ่",
      descriptionEnglish: "Large fresh river prawns",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/prawns.jpg",
    },
    {
      category: "Premium Buffet",
      nameThai: "หอยนางรม",
      nameEnglish: "Fresh Oysters",
      descriptionThai: "หอยนางรมสดจากทะเล",
      descriptionEnglish: "Fresh ocean oysters",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/oysters.jpg",
    },
    {
      category: "Premium Buffet",
      nameThai: "ปลาแซลมอนสด",
      nameEnglish: "Fresh Salmon",
      descriptionThai: "ปลาแซลมอนสดนำเข้า",
      descriptionEnglish: "Imported fresh salmon",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/salmon.jpg",
    },
    {
      category: "Premium Buffet",
      nameThai: "เนื้อหมูคูโรบูตะ",
      nameEnglish: "Kurobuta Pork",
      descriptionThai: "เนื้อหมูคูโรบูตะพรีเมี่ยม",
      descriptionEnglish: "Premium Kurobuta pork",
      price: 0,
      availability: "Available",
      imageUrl: "/images/menu/kurobuta.jpg",
    },

    // Special Menu (à la carte with prices)
    {
      category: "Special Menu",
      nameThai: "ซูชิแซลมอน",
      nameEnglish: "Salmon Sushi",
      descriptionThai: "ซูชิแซลมอนสด 8 ชิ้น",
      descriptionEnglish: "Fresh salmon sushi, 8 pieces",
      price: 180,
      availability: "Available",
      imageUrl: "/images/menu/salmon-sushi.jpg",
    },
    {
      category: "Special Menu",
      nameThai: "ซาชิมิรวม",
      nameEnglish: "Mixed Sashimi",
      descriptionThai: "ซาชิมิปลาสดรวม 12 ชิ้น",
      descriptionEnglish: "Assorted fresh sashimi, 12 pieces",
      price: 250,
      availability: "Available",
      imageUrl: "/images/menu/sashimi.jpg",
    },
    {
      category: "Special Menu",
      nameThai: "สเต็กเนื้อวากิว",
      nameEnglish: "Wagyu Steak",
      descriptionThai: "สเต็กเนื้อวากิว 200 กรัม",
      descriptionEnglish: "200g Wagyu beef steak",
      price: 450,
      availability: "Available",
      imageUrl: "/images/menu/wagyu-steak.jpg",
    },
    {
      category: "Special Menu",
      nameThai: "ข้าวผัดกุ้ง",
      nameEnglish: "Prawn Fried Rice",
      descriptionThai: "ข้าวผัดกุ้งสด",
      descriptionEnglish: "Fried rice with fresh prawns",
      price: 120,
      availability: "Available",
      imageUrl: "/images/menu/prawn-rice.jpg",
    },
    {
      category: "Special Menu",
      nameThai: "น้ำอัดลม",
      nameEnglish: "Soft Drink",
      descriptionThai: "น้ำอัดลมเย็น",
      descriptionEnglish: "Chilled soft drink",
      price: 20,
      availability: "Available",
      imageUrl: "/images/menu/soft-drink.jpg",
    },
    {
      category: "Special Menu",
      nameThai: "ชาไทย",
      nameEnglish: "Thai Iced Tea",
      descriptionThai: "ชาไทยเย็นแท้",
      descriptionEnglish: "Authentic Thai iced tea",
      price: 30,
      availability: "Available",
      imageUrl: "/images/menu/thai-tea.jpg",
    },
  ];

  await MenuItem.deleteMany({}); // Clear existing menu items
  await MenuItem.insertMany(menuItems);

  console.log(`✅ Created ${menuItems.length} menu items`);
  console.log(
    `   - Starter Buffet: ${
      menuItems.filter((i) => i.category === "Starter Buffet").length
    } items`
  );
  console.log(
    `   - Premium Buffet: ${
      menuItems.filter((i) => i.category === "Premium Buffet").length
    } items`
  );
  console.log(
    `   - Special Menu: ${
      menuItems.filter((i) => i.category === "Special Menu").length
    } items`
  );
};

const seed = async () => {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/moomoo";
    await mongoose.connect(mongoUri);
    console.log("📦 Connected to MongoDB");

    // Run seed operations
    await seedTables();
    await seedMenuItems();

    console.log("\n✨ Seeding complete!");
    console.log("📊 Summary:");
    console.log("   - 10 tables initialized (Available status)");
    console.log("   - 16 menu items created (5 Starter, 5 Premium, 6 Special)");
    console.log("\n🚀 Ready to start restaurant operations!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run seed
seed();

export { seedTables, seedMenuItems, seed };
