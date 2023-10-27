const express = require("express");
const {
  createUser,
  login,
  checkAuth,
  resetPasswordRequest,
  resetPassword,
} = require("../controller/Auth");
const passport = require("passport");
const router = express.Router();

router
  .post("/signup", createUser)
  .post("/reset-password-request", resetPasswordRequest)
  .post("/reset-password", resetPassword)
  .post("/login", passport.authenticate("local"), login)
  .get("/check", passport.authenticate("jwt"), checkAuth);

exports.router = router;
