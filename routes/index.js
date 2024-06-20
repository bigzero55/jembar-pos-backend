const express = require("express");
const router = express.Router();
const StocksRouter = require("./stocks");
const salesRouter = require("./sales");
const Consuments = require("./consuments");
const Suplayers = require("./suplayers");
const Return = require("./retur");
const Analystic = require("./analystic");

router.use("/stocks", StocksRouter);
router.use("/consuments", Consuments);
router.use("/suplayers", Suplayers);
router.use("/sales", salesRouter);
router.use("/retur", Return);
router.use("/analystic", Analystic);

router.get("/status", (req, res) => {
  res.json({
    status: "ok",
  });
});

module.exports = router;
