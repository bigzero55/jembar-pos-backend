const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Get all items
router.get("/", (req, res) => {
  const sql = "SELECT * FROM Stocks";
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
  const {
    name,
    motif,
    motif_code,
    seri,
    grade,
    stock_pcs,
    stock_yard,
    price_buy,
    price_sell,
    update_add_stock,
    update_sell,
  } = req.body;
  const sql = `INSERT INTO Stocks (name, motif, motif_code, seri, grade, stock_pcs, stock_yard, price_buy, price_sell, update_add_stock, update_sell) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    name,
    motif,
    motif_code,
    seri,
    grade,
    stock_pcs,
    stock_yard,
    price_buy,
    price_sell,
    update_add_stock,
    update_sell,
  ];
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
  const {
    name,
    motif,
    motif_code,
    seri,
    grade,
    price_sell,
    stock_pcs,
    stock_yard,
  } = req.body;
  const sql = `UPDATE Stocks
               SET name = ?, motif_code = ?, motif = ?, seri = ?, grade = ?, price_sell = ?, stock_pcs = ?, stock_yard = ?
               WHERE id = ?`;
  const params = [
    name,
    motif_code,
    motif,
    seri,
    grade,
    price_sell,
    stock_pcs,
    stock_yard,
    id,
  ];
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
  const sql = "DELETE FROM Stocks WHERE id = ?";
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
