const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

// importing middlerwares
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// import routes
const userRouter = require("./routes/user.route.js");
const productRouter = require("./routes/product.route.js");
const contactRouter = require("./routes/contact.route.js");
const errorHandler = require("./middleware/error.middleware.js");

// Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/contact", contactRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
