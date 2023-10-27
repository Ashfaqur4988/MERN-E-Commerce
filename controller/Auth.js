const { User } = require("../model/User");
const crypto = require("crypto"); //in built salt provider
const { sanitizeUser, sendMail } = require("../services/common");
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

exports.resetPasswordRequest = async (req, res) => {
  //let send email and a token in the mail body so we can verify that user has clicked right link
  // a token along with the link will be provided for verification
  const email = req.body.email;
  const user = await User.findOne({ email: email });

  if (user) {
    const token = crypto.randomBytes(64).toString("hex");
    user.resetPasswordToken = token;
    await user.save();

    //also set token in email
    const resetPage = `http://localhost:3000/reset-password?token=${token}&email=${email}`;
    const subject = `reset password for Quick Buy`;
    const html = `<p><a href='${resetPage}'> Click here</a> to Reset Password</p>`;
    const text = ``;

    if (email) {
      const data = await sendMail({ to: req.body.email, subject, html, text });
      res.send(data);
    } else {
      res.status(400);
    }
  } else {
    res.sendStatus(400);
  }
};

exports.resetPassword = async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email: email, resetPasswordToken: token });

  if (user) {
    const salt = crypto.randomBytes(16); //salt for covering the password
    //function for encrypting the password
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        user.password = hashedPassword;
        user.salt = salt;
        user.save();

        //send the acknowledgement
        const subject = `Password successfully reset for Quick Buy`;
        const html = `<p>Successfully reset password</p>`;

        if (email) {
          const data = await sendMail({
            to: email,
            subject,
            html,
          });
          res.send(data);
        } else {
          res.status(400);
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
};
