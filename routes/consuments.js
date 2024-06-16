const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM Consuments";
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
  const sql = "SELECT * FROM Consuments WHERE id = ?";
  const params = [id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Consument not found" });
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
  const sql = `SELECT * FROM Stocks WHERE name LIKE '%' || ?`;
  const params = [key];

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

router.post("/", (req, res) => {
  const { name, phone, address, company, add_date } = req.body;
  const sql = `INSERT INTO Consuments (name, phone, address, company, add_date) 
                VALUES (?, ?, ?, ?, ?)`;
  const params = [name, phone, address, company, add_date];
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
  const { name, phone, address, company } = req.body;
  const sql = `UPDATE Consuments
               SET name = ?, phone = ?, address = ?, company = ?
               WHERE id = ?`;
  const params = [name, phone, address, company, id];
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
  const sql = `DELETE FROM Consuments WHERE id = ?`;
  const params = [id];
  db.run(sql, params, function (err) {
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
