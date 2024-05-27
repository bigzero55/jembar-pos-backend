const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3002;

const indexRouter = require("./routes/index");
const basicAuth = require("./middlewares/auth");

app.use(cors()); // Enable CORS for all requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(basicAuth); // Apply Basic Authentication middleware

app.use("/api", indexRouter);

module.exports = app;
