const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Get all sales
router.get("/", (req, res) => {
  const sql = "SELECT * FROM sales";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// Add new sale
router.post("/", (req, res) => {
  const { item_id, quantity, total } = req.body;
  const sql = "INSERT INTO sales (item_id, quantity, total) VALUES (?,?,?)";
  const params = [item_id, quantity, total];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: { id: this.lastID },
    });
  });
});

module.exports = router;
