require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session"); //session
const passport = require("passport"); //passport
const LocalStrategy = require("passport-local").Strategy; //local strategy
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const JwtStrategy = require("passport-jwt").Strategy; //jwt  strategy already present in passport
const ExtractJwt = require("passport-jwt").ExtractJwt; // extract jwt from client request
const productsRouters = require("./routes/Products"); //'/products' is the base path
const nodemailer = require("nodemailer"); //nodemailer
const brandsRouters = require("./routes/Brands");
const categoryRouters = require("./routes/Categories");
const userRouters = require("./routes/User");
const authRouters = require("./routes/Auth");
const cartRouters = require("./routes/Cart");
const orderRouters = require("./routes/Order");
const { User } = require("./model/User");
const crypto = require("crypto");
const path = require("path");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");

//jwt options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;

//send password reset mail
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     // TODO: replace `user` and `pass` values from <https://forwardemail.net>
//     user: "ashfakur1@gmail.com",
//     pass: process.env.MAILER_PASSWORD,
//   },
// });

//webhook
//TODO: we will capture the actual order after deploying out in our server
const endpointSecret = process.env.ENDPOINT_SECRET;
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log(paymentIntentSucceeded);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

//middlewares
app.use(express.static(path.resolve(__dirname, "build"))); //for build

app.use(cookieParser()); //cookie parser
//session
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false, //don't save session if unmodified
    saveUninitialized: false, //don't create session until something is stored
  })
);

app.use(passport.authenticate("session")); //adding session

//cors
app.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);

app.use(express.json()); //to parse req.body

app.use("/products", isAuth(), productsRouters.router);
app.use("/brands", isAuth(), brandsRouters.router);
app.use("/category", isAuth(), categoryRouters.router);
app.use("/users", isAuth(), userRouters.router);
app.use("/auth", authRouters.router);
app.use("/cart", isAuth(), cartRouters.router);
app.use("/orders", isAuth(), orderRouters.router);

//Mail endpoint
// app.post("/mail", async (req, res) => {
//   // send mail with defined transport object
//   const { to } = req.body;
//   const info = await transporter.sendMail({
//     from: '"E-commerce" <ashfakur1@gmail.com>', // sender address
//     to: to, // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
//   });

//   res.json(info);
// });

//passport strategies
passport.use(
  "local",
  new LocalStrategy(
    //by default passport uses username
    { usernameField: "email" },
    async function (email, password, done) {
      try {
        const user = await User.findOne({ email: email }).exec();
        console.log(email, password, user);

        if (!user) {
          return done(null, false, { message: "No such user" }); //when no such user found
        }

        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          "sha256",
          async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
              return done(null, false, { message: "invalid credentials" }); //when wrong credentials
            }
            const token = jwt.sign(
              sanitizeUser(user),
              process.env.JWT_SECRET_KEY
            );
            return done(null, { id: user.id, role: user.role, token }); //when user found, this line sends a serializer
          }
        );
      } catch (error) {
        done(error);
      }
    }
  )
);

//jwt strategy
passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log({ jwt_payload });
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); //this calls serializer
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

//this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  console.log("serialize", user);
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      role: user.role,
    });
  });
});

//this changes session variable req.user on being called from authorized request
passport.deserializeUser(function (user, cb) {
  console.log("de-serialize", user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

//payment with stripe
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

app.post("/create-payment-intent", async (req, res) => {
  const { totalAmount } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100, // need to go to the decimal
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

//db connection
try {
  mongoose.connect(process.env.MONGODB_URL);
  console.log("DB connection done");
} catch (error) {
  console.log(error);
}

//listener code to run the server
app.listen(process.env.PORT, (req, res) => {
  console.log("Server is running on port 8080");
});
