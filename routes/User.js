const express = require("express");
const { fetchLoggedInUser, updateUser } = require("../controller/User");
const router = express.Router();

router.get("/own", fetchLoggedInUser).patch("/:id", updateUser);

exports.router = router;
