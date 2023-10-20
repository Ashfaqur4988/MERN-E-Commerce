const {
  addProduct,
  fetchAllProduct,
  fetchProductById,
  updateProduct,
} = require("../controller/Product");
const express = require("express");

const router = express.Router();

//for post request of creating a product
// '/products' from the base path
router
  .post("/", addProduct) //creating a product
  .get("/", fetchAllProduct) //fetching all products with filter, sort, pagination
  .get("/:id", fetchProductById) //fetch product with id (from parameter)
  .patch("/:id", updateProduct); //update product

//exporting the router
exports.router = router;
