const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Get all items
router.get("/", (req, res) => {
  const sql = "SELECT * FROM items";
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

// Add new item
router.post("/", (req, res) => {
  const { name, price } = req.body;
  const sql = "INSERT INTO items (name, price) VALUES (?,?)";
  const params = [name, price];
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

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const sql = "UPDATE items SET name = ?, price = ? WHERE id = ?";
  const params = [name, price, id];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: { id: id },
    });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM items WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "deleted",
      data: { id: id },
    });
  });
});

module.exports = router;
