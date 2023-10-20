const express = require("express");
const { fetchAllBrands, createBrands } = require("../controller/Brand");

const router = express.Router();

router.get("/", fetchAllBrands).post("/", createBrands);

exports.router = router;
