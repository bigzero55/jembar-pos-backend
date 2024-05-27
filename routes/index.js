const express = require("express");
const router = express.Router();
const StocksRouter = require("./stocks");
const salesRouter = require("./sales");

router.use("/stocks", StocksRouter);
router.use("/sales", salesRouter);

router.get("/status", (req, res) => {
  res.json({
    status: "ok",
  });
});

module.exports = router;
