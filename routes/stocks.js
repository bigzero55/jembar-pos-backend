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

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM Stocks WHERE id = ?";
  const params = [id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Stock not found" });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

router.get("/search/:key", (req, res) => {
  const { key } = req.params;
  const sql = `
    SELECT * FROM Stocks 
    WHERE 
        name LIKE '%' || ? || '%' OR 
        motif LIKE '%' || ? || '%' OR 
        motif_code = ? OR 
        seri LIKE '%' || ? || '%'
  `;
  const params = [key, key, key, key];

  db.all(sql, params, (err, rows) => {
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

router.post("/add-stock/:id", (req, res) => {
  const { stock_pcs, stock_yard, time } = req.body;
  const { id } = req.params;
  if (typeof stock_pcs !== "number" || typeof stock_yard !== "number") {
    return res.status(400).json({
      error: "Invalid input. Both stock_pcs and stock_yard must be numbers.",
    });
  }
  const sql = `UPDATE Stocks 
               SET stock_pcs = stock_pcs + ?, 
                   stock_yard = stock_yard + ?,
                   update_add_stock = ?
               WHERE id = ?`;
  const params = [stock_pcs, stock_yard, time, id];
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Stock updated successfully" });
  });
});

router.post("/import", (req, res) => {
  const jsonData = req.body;

  // Iterasi melalui data JSON dan masukkan ke dalam database SQLite
  jsonData.forEach((data) => {
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
    } = data;

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
        console.error("Error inserting data:", err.message);
      } else {
        console.log("Data inserted successfully with ID:", this.lastID);
      }
    });
  });

  res.json({ message: "Data imported successfully" });
});

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
  const { name, motif, motif_code, seri, grade, price_sell } = req.body;
  const sql = `UPDATE Stocks
               SET name = ?, motif_code = ?, motif = ?, seri = ?, grade = ?, price_sell = ?
               WHERE id = ?`;
  const params = [name, motif_code, motif, seri, grade, price_sell, id];
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
