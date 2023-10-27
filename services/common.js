const passport = require("passport");
const nodemailer = require("nodemailer"); //nodemailer

//send password reset mail
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "ashfakur1@gmail.com",
    pass: process.env.MAILER_PASSWORD,
  },
});

//Mail endpoint function
exports.sendMail = async ({ to, subject, text, html }) => {
  // send mail with defined transport object

  const info = await transporter.sendMail({
    from: '"E-commerce" <ashfakur1@gmail.com>', // sender address
    to, // list of receivers
    subject,
    text,
    html,
  });
  return info;
};

exports.isAuth = (req, res, next) => {
  return passport.authenticate("jwt");
};

exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

//cookie extractor
exports.cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};
