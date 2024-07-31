const router = require("express").Router();
const {
  createProduct,
  editProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const protect = require("../middleware/auth.middleware");

router.post("/createproduct", protect, createProduct);
router.get("/allproducts", protect, getAllProducts);
router.get("/:id", protect, getProduct);
router.delete("/:id", protect, deleteProduct);
router.patch("/:id", protect, editProduct);

module.exports = router;
