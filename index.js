const initializeDatabase = require("./db/db.connect.js");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
app.use(express.json());
const Product =  require("./models/product.model.js");
const Category =  require("./models/category.model.js");

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));


// ====== DB INIT & SEED =======


function seedProducts() {
  const jsonData = fs.readFileSync("./products.json", "utf-8");
  const productData = JSON.parse(jsonData);
  try {
    for (const prod of productData) {
      const newProduct = new Product({
        productId: prod.productId,
        name: prod.name,
        image: prod.image,
        price: prod.price,
        rating: prod.rating,
        category: prod.category,
        categoryId: prod.categoryId
      });    
      console.log(newProduct.name);
      newProduct.save();
  }
  } catch (error) {
    console.log("Errrrrroooorrrrrrrrrrrr in connecting database", error);
  }
}


// function seedProducts() {
//   try {
//     const productsPath = path.join(__dirname, "products.json");
//     console.log("Reading products file at:", productsPath);
//     console.log("Exists:", fs.existsSync(productsPath));
//     if (fs.existsSync(productsPath)) {
//       try {
//         const stats = fs.statSync(productsPath);
//         console.log("Products file stat size:", stats.size);
//       } catch (sErr) {
//         console.error("Products stat error:", sErr && sErr.message ? sErr.message : sErr);
//       }
//     }
//     const rawProducts = fs.readFileSync(productsPath);
//     console.log("Products raw buffer length:", rawProducts.length);
//     const jsonData = rawProducts.toString("utf8");
//     if (!jsonData || !jsonData.trim()) {
//       console.error(`Products file is empty or unreadable: ${productsPath}`);
//       return;
//     }
//     // Helpful debug output if something goes wrong parsing JSON
//     let productData;
//     try {
//       productData = JSON.parse(jsonData);
//     } catch (parseErr) {
//       console.error(`Failed to parse products JSON (${productsPath}), length=${jsonData.length}`);
//       console.error("Products JSON snippet:", jsonData.slice(0, 200));
//       throw parseErr;
//     }

//     for (const prod of productData) {
//       const newProduct = new Product({
//         productId: prod.productId,
//         name: prod.name,
//         image: prod.image,
//         price: prod.price,
//         rating: prod.rating,
//         category: prod.category,
//         categoryId: prod.categoryId
//       });
//       newProduct.save().then(() => {
//         console.log("Product saved:", newProduct.name);
//       }).catch((err) => {
//         console.error("Error saving product", prod.productId, err.message);
//       });
//     }
//   } catch (error) {
//     console.log("Error while seeding products:", error);
//   }
// }

function seedCategories() {
  try {
    const categoriesPath = path.join(__dirname, "category.json");
    console.log("Reading categories file at:", categoriesPath);
    console.log("Exists:", fs.existsSync(categoriesPath));
    if (fs.existsSync(categoriesPath)) {
      try {
        const stats = fs.statSync(categoriesPath);
        console.log("Categories file stat size:", stats.size);
      } catch (sErr) {
        console.error("Categories stat error:", sErr && sErr.message ? sErr.message : sErr);
      }
    }
    const rawCategories = fs.readFileSync(categoriesPath);
    console.log("Categories raw buffer length:", rawCategories.length);
    const jsonData = rawCategories.toString("utf8");
    if (!jsonData || !jsonData.trim()) {
      console.error(`Categories file is empty or unreadable: ${categoriesPath}`);
      return;
    }
    let categoryData;
    try {
      categoryData = JSON.parse(jsonData);
    } catch (parseErr) {
      console.error(`Failed to parse categories JSON (${categoriesPath}), length=${jsonData.length}`);
      console.error("Categories JSON snippet:", jsonData.slice(0, 200));
      throw parseErr;
    }

    for (const cat of categoryData) {
      const newCategory = new Category({
        name: cat.name,
        categoryId: cat.categoryId
      });
      newCategory.save().then(() => {
        console.log("Category saved:", newCategory.name);
      }).catch((err) => {
        console.error("Error saving category", cat.categoryId, err.message);
      });
    }
  } catch (error) {
    console.log("Error while seeding categories:", error);
  }
}

// Wait for DB initialization to finish before seeding.
// This ensures we don't attempt to save before a connection is established
// and avoids surprises from relative file paths when running from another cwd.


(async () => {
  try {
    await initializeDatabase();
    console.log("DB init finished, starting seed...");

    // Seed categories first (optional) then products
    
    // seedCategories();
    // seedProducts();
  } catch (err) {
    console.error("Failed to initialize DB or seed data:", err && err.message ? err.message : err);
    // Re-throw or exit depending on desired behavior; here we just log.
  }
})();


// ===== CREATE FUNCTIONS =====

async function createProduct(newProduct) {
  try {
    const product = new Product(newProduct);
    const saveProduct = await product.save();
    console.log("New Product data:", saveProduct);
    return saveProduct;
  } catch (error) {
    throw error;
  }
}

async function createCategory(newCategory) {
  try {
    const category = new Category(newCategory);
    const saveCategory = await category.save();
    console.log("New Category data:", saveCategory);
    return saveCategory;
  } catch (error) {
    throw error;
  }
}

// createProduct(productObj)
// createProduct()

// createCategory(categoryObj)
// createCategory()

// Example: call `createProduct(productObj)` or `createCategory(categoryObj)` after DB connection.

// ====== ROUTES =======

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ data: { products } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET product by productId
app.get("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ data: { product } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ data: { categories } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET category by categoryId
app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const category = await Category.findOne({ categoryId: req.params.categoryId });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ data: { category } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== START SERVER =======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});






