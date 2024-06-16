const sqlite3 = require("sqlite3").verbose();

const DBSOURCE = "db/database.db";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("Database Terkoneksi dengan baik");

    db.run(
      `CREATE TABLE IF NOT EXISTS Stocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                motif TEXT,
                motif_code INTEGER,
                seri TEXT,
                grade TEXT,
                stock_pcs INTEGER,
                stock_yard INTEGER,
                price_buy INTEGER,
                price_sell INTEGER,
                update_add_stock INTEGER,
                update_sell INTEGER
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Add_Stocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                motif TEXT,
                motif_code INTEGER,
                seri TEXT,
                grade TEXT,
                pcs INTEGER,
                yard INTEGER,
                id_officer INTEGER,
                id_stock INTEGER,
                id_suplayer INTEGER,
                tgl INTEGER
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Items_Sold (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                motif TEXT,
                motif_code INTEGER,
                seri TEXT,
                grade TEXT,
                id_consument INTEGER,
                id_officer INTEGER,
                id_stock INTEGER,
                id_transaction INTEGER,
                amount_pcs INTEGER,
                amount_yard INTEGER,
                price_buy INTEGER,
                price_sell INTEGER
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Return (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                motif TEXT,
                motif_code INTEGER,
                seri TEXT,
                grade TEXT,
                id_consument INTEGER,
                id_officer INTEGER,
                id_stock INTEGER,
                id_transaction INTEGER,
                amount_pcs INTEGER,
                amount_yard INTEGER,
                price_buy INTEGER,
                price_sell INTEGER,
                canSell TEXT,
                tgl INTEGER
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Suplayer (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT,
                address TEXT,
                company TEXT,
                add_date INTEGER
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                advantage INTEGER,
                capital INTEGER,
                id_consument INTEGER,
                id_officer INTEGER,
                margin INTEGER,
                note TEXT,
                status TEXT DEFAULT 'success',
                date INTEGER
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Consuments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT,
                address TEXT,
                company TEXT,
                add_date INTEGER
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
});

module.exports = db;
