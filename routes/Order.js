const express = require("express");
const {
  fetchLoggedInUserOrders,
  createOrder,
  adminUpdateOrder,
  fetchAllOrders,
} = require("../controller/Order");
const router = express.Router();

router
  .get("/own/", fetchLoggedInUserOrders)
  .post("/", createOrder)
  .patch("/:id", adminUpdateOrder)
  .get("/", fetchAllOrders);

exports.router = router;
