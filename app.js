const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
require("express-async-errors");

//rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocumentation = YAML.load("./swagger.yaml");

//Packages for Heroku
const rateLimitter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

//Database
const connectDB = require("./db/connect");

//Middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//Routers
const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const productsRouter = require("./routes/productRoute");
const reviewRouter = require("./routes/reviewRoutes");

app.set("trust proxy");
app.use(
  rateLimitter({
    window: 15 * 60 * 1000,
    max: 60,
  })
);

app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

//Parse incoming json requests from req.body
app.use(express.json());
//To make the resources avaliable for requests that are from different origin;
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocumentation));

app.get("/", (req, res) => {
  res.send("Welcome to Ecommerce API");
});

app.get("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send("Ecommerce APIlo");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/reviews", reviewRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Sever is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
