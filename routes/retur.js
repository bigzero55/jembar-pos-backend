const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM Return";
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
  const sql = "SELECT * FROM Return WHERE id = ?";
  const params = [id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Return not found" });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

router.post("/", (req, res) => {
  // Ambil data dari body request
  const {
    name,
    motif,
    motif_code,
    seri,
    grade,
    id_consument,
    id_officer,
    id_stock,
    id_transaction,
    amount_pcs,
    amount_yard,
    price_buy,
    price_sell,
    canSell,
  } = req.body;

  // Query SQL untuk memasukkan data ke tabel Return
  const sql = `
      INSERT INTO Return (
          name, motif, motif_code, seri, grade, id_consument, id_officer, id_stock, id_transaction,
          amount_pcs, amount_yard, price_buy, price_sell, canSell
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name,
    motif,
    motif_code,
    seri,
    grade,
    id_consument,
    id_officer,
    id_stock,
    id_transaction,
    amount_pcs,
    amount_yard,
    price_buy,
    price_sell,
    canSell,
  ];

  // Jalankan query
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "success",
      data: { id: this.lastID },
    });
  });
});

module.exports = router;
