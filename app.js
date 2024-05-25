// app.js
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const indexRouter = require("./routes/index");
const basicAuth = require("./middlewares/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(basicAuth); // Apply Basic Authentication middleware

app.use("/api", indexRouter);

module.exports = app;
