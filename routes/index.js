const express = require("express");
const router = express.Router();
const itemsRouter = require("./items");
const salesRouter = require("./sales");

router.use("/items", itemsRouter);
router.use("/sales", salesRouter);

router.get("/status", (req, res) => {
  res.json({
    status: "ok",
  });
});

module.exports = router;
