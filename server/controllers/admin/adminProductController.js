const Product = require("../../models/Product");

// @desc    Get all products (admin)
// @route   GET /api/admin/products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, category, brand, images, stock, isFeatured } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      discountPrice: discountPrice || 0,
      category,
      brand: brand || "Unbranded",
      images: images || [],
      stock: stock || 0,
      isFeatured: isFeatured || false,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const fields = ["name", "description", "price", "discountPrice", "category", "brand", "images", "stock", "isFeatured"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.name) {
      product.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
