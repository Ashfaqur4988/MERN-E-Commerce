const express = require("express");
const {
  fetchItemsByUserId,
  addToCart,
  deleteItemFromCart,
  updateCart,
} = require("../controller/Cart");
const router = express.Router();

router
  .get("/", fetchItemsByUserId)
  .post("/", addToCart)
  .delete("/:id", deleteItemFromCart)
  .patch("/:id", updateCart);

exports.router = router;
