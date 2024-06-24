const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Get all sales
router.get("/", (req, res) => {
  const sql = "SELECT * FROM Transactions";
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

router.post("/search-by-note", (req, res) => {
  const { note } = req.body;
  const sql = "SELECT id FROM Transactions WHERE note = ?";
  const params = [note];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

router.get("/items", (req, res) => {
  const sql = "SELECT * FROM Items_Sold";
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

router.get("/transaction-items/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM Items_Sold WHERE id_transaction = ?";
  const params = [id];
  db.all(sql, params, (err, row) => {
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

router.post("/", (req, res) => {
  const { trans, items } = req.body;
  if (!trans || !items) {
    return res.status(400).json({ error: "Data tidak boleh kosong" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION", (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to begin transaction" });
      }

      const addTransSQL = `
        INSERT INTO Transactions (advantage, capital, id_consument, id_officer, margin, note, status, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const transParams = [
        trans.advantage,
        trans.capital,
        trans.id_consument,
        trans.id_officer,
        trans.margin,
        trans.note,
        trans.status,
        trans.date,
      ];

      db.run(addTransSQL, transParams, function (err) {
        if (err) {
          db.run("ROLLBACK", () => {
            return res.status(500).json({
              error: "Failed to insert into Transactions",
              details: err.message,
            });
          });
          return;
        }
        const transID = this.lastID;

        // Function to handle items insertions
        function insertItems(index) {
          if (index >= items.length) {
            // All items processed, commit the transaction
            db.run("COMMIT", (err) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: "Failed to commit transaction" });
              }
              res.json({
                message: "Transaction completed successfully",
                transID: transID,
                status: "success",
              });
            });
            return;
          }

          const item = items[index];
          const {
            name,
            motif,
            motif_code,
            seri,
            grade,
            id_consument,
            id_officer,
            id_stock,
            amount_pcs,
            amount_yard,
            price_buy,
            price_sell,
          } = item;

          const insertItemSQL = `
            INSERT INTO Items_Sold (
              name, motif, motif_code, seri, grade,
              id_consument, id_officer, id_stock, id_transaction,
              amount_pcs, amount_yard, price_buy, price_sell
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          const params = [
            name,
            motif,
            motif_code,
            seri,
            grade,
            id_consument,
            id_officer,
            id_stock,
            transID,
            amount_pcs,
            amount_yard,
            price_buy,
            price_sell,
          ];

          db.run(insertItemSQL, params, function (err) {
            if (err) {
              db.run("ROLLBACK", () => {
                return res.status(500).json({
                  error: "Failed to insert into Items_Sold",
                  details: err.message,
                });
              });
              return;
            }

            const updateStockSQL = `
              UPDATE Stocks 
              SET stock_pcs = stock_pcs - ?, 
                  stock_yard = stock_yard - ?,
                  update_sell = ?
              WHERE id = ?`;
            const updateParams = [
              amount_pcs,
              amount_yard,
              trans.date,
              id_stock,
            ];

            db.run(updateStockSQL, updateParams, function (err) {
              if (err) {
                db.run("ROLLBACK", () => {
                  return res.status(500).json({
                    error: "Failed to update Stocks",
                    details: err.message,
                  });
                });
                return;
              }
              // Process next item
              insertItems(index + 1);
            });
          });
        }

        // Start inserting items
        insertItems(0);
      });
    });
  });
});

router.post("/cancel-transaction", (req, res) => {
  const { id_transaction } = req.body;

  if (!id_transaction) {
    return res.status(400).json({ error: "Transaction ID is required" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION", (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to begin transaction" });
      }

      // Ambil semua item yang terkait dengan transaksi ini
      const getItemsSQL = `SELECT * FROM Items_Sold WHERE id_transaction = ?`;
      db.all(getItemsSQL, [id_transaction], (err, items) => {
        if (err) {
          db.run("ROLLBACK", () => {
            return res.status(500).json({
              error: "Failed to retrieve items",
              details: err.message,
            });
          });
          return;
        }

        // Jika tidak ada item yang ditemukan, rollback dan hentikan
        if (items.length === 0) {
          db.run("ROLLBACK", () => {
            return res.status(404).json({ error: "Transaction not found" });
          });
          return;
        }

        // Fungsi untuk mengembalikan stok item
        function restoreStock(index) {
          if (index >= items.length) {
            // Semua item sudah diproses, hapus catatan transaksi
            const deleteTransactionSQL = `DELETE FROM Transactions WHERE id = ?`;
            db.run(deleteTransactionSQL, [id_transaction], function (err) {
              if (err) {
                db.run("ROLLBACK", () => {
                  return res.status(500).json({
                    error: "Failed to delete transaction",
                    details: err.message,
                  });
                });
                return;
              }
              // Lakukan commit jika semua operasi berhasil
              db.run("COMMIT", (err) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "Failed to commit transaction" });
                }
                res.json({
                  message: "Transaction canceled successfully",
                  status: "success",
                });
              });
            });
            return;
          }

          const item = items[index];
          const { id_stock, amount_pcs, amount_yard } = item;

          // Update stok untuk mengembalikan jumlah yang sudah dijual
          const restoreStockSQL = `
            UPDATE Stocks 
            SET stock_pcs = stock_pcs + ?, 
                stock_yard = stock_yard + ?
            WHERE id = ?`;
          const restoreParams = [amount_pcs, amount_yard, id_stock];

          db.run(restoreStockSQL, restoreParams, function (err) {
            if (err) {
              db.run("ROLLBACK", () => {
                return res.status(500).json({
                  error: "Failed to restore stock",
                  details: err.message,
                });
              });
              return;
            }

            // Hapus item dari tabel Items_Sold setelah stok dikembalikan
            const deleteItemSQL = `DELETE FROM Items_Sold WHERE id = ?`;
            db.run(deleteItemSQL, [item.id], function (err) {
              if (err) {
                db.run("ROLLBACK", () => {
                  return res.status(500).json({
                    error: "Failed to delete item",
                    details: err.message,
                  });
                });
                return;
              }

              // Proses item berikutnya
              restoreStock(index + 1);
            });
          });
        }

        // Mulai proses pengembalian stok untuk setiap item
        restoreStock(0);
      });
    });
  });
});

router.post("/return", (req, res) => {
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
    tgl,
  } = req.body;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION", (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to begin transaction" });
      }

      // Insert ke tabel Return
      const insertReturnSQL = `
        INSERT INTO Return (
          name, motif, motif_code, seri, grade,
          id_consument, id_officer, id_stock, id_transaction,
          amount_pcs, amount_yard, price_buy, price_sell, canSell, tgl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const returnParams = [
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
        tgl,
      ];

      db.run(insertReturnSQL, returnParams, function (err) {
        if (err) {
          db.run("ROLLBACK", () => {
            return res.status(500).json({
              error: "Failed to insert into Return",
              details: err.message,
            });
          });
          return;
        }

        // Update status pada tabel Transactions
        const updateTransactionSQL = `
          UPDATE Transactions 
          SET status = 'return'
          WHERE id = ?`;
        const updateTransactionParams = [id_transaction];

        db.run(updateTransactionSQL, updateTransactionParams, function (err) {
          if (err) {
            db.run("ROLLBACK", () => {
              return res.status(500).json({
                error: "Failed to update Transactions status",
                details: err.message,
              });
            });
            return;
          }

          // Jika canSell adalah "YA", tambahkan jumlah stok kembali ke tabel Stocks
          if (canSell === "YA") {
            const updateStockSQL = `
              UPDATE Stocks 
              SET stock_pcs = stock_pcs + ?, 
                  stock_yard = stock_yard + ?
              WHERE id = ?`;
            const updateStockParams = [amount_pcs, amount_yard, id_stock];

            db.run(updateStockSQL, updateStockParams, function (err) {
              if (err) {
                db.run("ROLLBACK", () => {
                  return res.status(500).json({
                    error: "Failed to update Stocks",
                    details: err.message,
                  });
                });
                return;
              }

              // Commit transaksi jika semua operasi berhasil
              db.run("COMMIT", (err) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "Failed to commit transaction" });
                }
                res.json({
                  message: "Return transaction completed successfully",
                  status: "success",
                });
              });
            });
          } else {
            // Commit transaksi jika hanya menambahkan ke tabel Return
            db.run("COMMIT", (err) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: "Failed to commit transaction" });
              }
              res.json({
                message: "Return transaction added to Return table only",
                status: "success",
              });
            });
          }
        });
      });
    });
  });
});

router.get("/check-return/:id_transaction", (req, res) => {
  const { id_transaction } = req.params;

  // Query untuk mencari barang yang diretur berdasarkan ID transaksi
  const sql = `
    SELECT * 
    FROM Return 
    WHERE id_transaction = ?`;

  db.all(sql, [id_transaction], (err, rows) => {
    if (err) {
      res
        .status(500)
        .json({
          error: "Failed to retrieve return items",
          details: err.message,
        });
      return;
    }

    if (rows.length === 0) {
      res.json({
        message: "No return items found for this transaction",
        data: [],
      });
    } else {
      res.json({
        message: "Return items found",
        data: rows,
      });
    }
  });
});

module.exports = router;
