const {
  addProduct,
  fetchAllProduct,
  fetchProductById,
  updateProduct,
} = require("../controller/Product");
const express = require("express");
const { Product } = require("../model/Product");

const router = express.Router();

//for post request of creating a product
// '/products' from the base path
router
  .post("/", addProduct) //creating a product
  .get("/", fetchAllProduct) //fetching all products with filter, sort, pagination
  .get("/:id", fetchProductById) //fetch product with id (from parameter)
  .patch("/:id", updateProduct); //update product

// .get("update/test", async (req, res) => {
//   const products = await Product.find({});
//   for (let product of products) {
//     product.discountPrice = Math.round(
//       product * price * (1 - product.discountPercentage / 100)
//     );
//     await product.save();
//     console.log(product.title + " updated");
//   }
//   res.send("ok");
//});

//exporting the router
exports.router = router;
