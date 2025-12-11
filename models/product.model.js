const mongoose = require("mongoose");
// import mongoose from "mongoose";

// Define Restaurant Schema
const ProductSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true }, // Business/product id
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    category: { type: String, required: true }, // Category name ref
    categoryId: { type: String, required: true }, // Category id
  },
  { timestamps: true }
);

// Export model
// const Product 
module.exports = mongoose.model("Product", ProductSchema);
// module.exports = Product;
