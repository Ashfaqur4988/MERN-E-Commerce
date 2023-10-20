const { User } = require("../model/User");
const crypto = require("crypto"); //in built salt provider
const { sanitizeUser } = require("../services/common");
const secret_key = "secret";
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16); //salt for covering the password
    //function for encrypting the password
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({ ...req.body, password: hashedPassword, salt }); //saving the encrypted password
        const doc = await user.save();

        req.login(sanitizeUser(doc), (err) => {
          //this also calls the serializer
          if (err) {
            res.status(400).json(err);
          } else {
            const token = jwt.sign(sanitizeUser(user), secret_key);
            res
              .cookie("jwt", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
              })
              .status(201)
              .json({ id: doc.id, role: doc.role });
          }
        });
      }
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.login = async (req, res) => {
  res
    .cookie("jwt", req.user.token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    })
    .status(201)
    .json(req.user.token); //req.user is a special object which is created by passport after authentication
};

//this will just check whether the user is authenticated or not
exports.checkAuth = async (req, res) => {
  if (req.user) {
    res.json(req.user); //req.user is a special object which is created by passport after authentication
  } else {
    res.sendStatus(401);
  }
};
