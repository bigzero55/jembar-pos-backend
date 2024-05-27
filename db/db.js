const sqlite3 = require("sqlite3").verbose();

const DBSOURCE = "database.db";

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
                tgl INTEGER,
                grade TEXT,
                id_officer INTEGER,
                id_stock INTEGER,
                id_suplayer INTEGER,
                motif TEXT,
                motif_code INTEGER,
                name TEXT,
                pcs INTEGER,
                seri TEXT,
                yard INTEGER
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
                amount_pcs INTEGER,
                amount_yard INTEGER,
                grade TEXT,
                id_consument INTEGER,
                id_officer INTEGER,
                id_stock INTEGER,
                id_transaction INTEGER,
                motif TEXT,
                motif_code INTEGER,
                name TEXT,
                price_buy REAL,
                price_sell REAL,
                seri TEXT,
                stock_pcs INTEGER,
                stock_yard INTEGER,
                update_add_stock INTEGER DEFAULT NULL,
                update_sell INTEGER NOT NULL
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
                add_date INTEGER,
                address TEXT,
                company TEXT,
                name TEXT,
                phone TEXT
            )`,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Items_Canceled (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount_pcs INTEGER,
                amount_yard INTEGER,
                grade TEXT,
                id_consument INTEGER,
                id_officer INTEGER,
                id_stock INTEGER,
                id_transaction INTEGER,
                motif TEXT,
                motif_code INTEGER,
                name TEXT,
                price_buy REAL,
                price_sell REAL,
                seri TEXT,
                stock_pcs INTEGER,
                stock_yard INTEGER,
                update_add_stock INTEGER DEFAULT NULL,
                update_sell INTEGER NOT NULL
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
                date INTEGER,
                id_consument INTEGER,
                id_officer INTEGER,
                margin INTEGER,
                note TEXT,
                status TEXT DEFAULT 'success'
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
                add_date INTEGER,
                address TEXT,
                company TEXT,
                name TEXT,
                phone TEXT
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
