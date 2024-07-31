const asyncHandler = require("express-async-handler");
const Product = require("../models/product.model");

const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;
  // validation check
  if (!name || !sku || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }
  const product = new Product({
    user: req.user._id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
  });
  // adding product into db
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// getting all products of specific user
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id }).sort(
    "-createdAt"
  );
  res.status(200).json(products);
});

// get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(400);
    throw new Error("Product not found !");
  }
  if (product.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You are not authorized to view this product");
  }
  res.status(200).json(product);
});

// delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // console.log(product);
  if (!product) {
    res.status(400);
    throw new Error("Product not found !");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("You are not authorized to delete this product");
  }
  await product.deleteOne({
    _id: req.params.id,
  });
  res.status(200).json({ message: "Product removed" });
});

// edit product or update product
const editProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found !");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("You are not authorized to edit this product");
  }

  product.name = name || product.name;
  product.sku = sku || product.sku;
  product.category = category || product.category;
  product.quantity = quantity || product.quantity;
  product.price = price || product.price;
  product.description = description || product.description;

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

module.exports = {
  createProduct,
  editProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
};
