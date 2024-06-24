const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/summary", (req, res) => {
  const { period, startDate, endDate } = req.query;

  let query = `
    SELECT 
      DATE(Transactions.date) as date, 
      SUM(price_sell * amount_yard) as total_sales
    FROM Transactions 
    JOIN Items_Sold ON Transactions.id = Items_Sold.id_transaction
    WHERE Transactions.status = 'success'
  `;

  if (period === "daily") {
    query += "GROUP BY DATE(Transactions.date)";
  } else if (period === "monthly") {
    query += "GROUP BY strftime('%Y-%m', Transactions.date)";
  } else if (period === "yearly") {
    query += "GROUP BY strftime('%Y', Transactions.date)";
  }

  if (startDate && endDate) {
    query += `
      HAVING DATE(Transactions.date) >= ?
      AND DATE(Transactions.date) <= ?
    `;
  }

  const params = startDate && endDate ? [startDate, endDate] : [];

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to retrieve sales summary",
        details: err.message,
      });
    }
    res.json(rows);
  });
});

router.get("/by-product", (req, res) => {
  const { startDate, endDate } = req.query;

  let query = `
    SELECT 
      Items_Sold.name,
      SUM(price_sell * amount_yard) as total_sales,
      SUM(amount_pcs) as total_pcs_sold,
      SUM(amount_yard) as total_yards_sold
    FROM Items_Sold
    JOIN Transactions ON Items_Sold.id_transaction = Transactions.id
    WHERE Transactions.status = 'success'
  `;

  if (startDate && endDate) {
    query += `
      AND DATE(Transactions.date) >= ?
      AND DATE(Transactions.date) <= ?
    `;
  }

  query += " GROUP BY Items_Sold.name";

  const params = startDate && endDate ? [startDate, endDate] : [];

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to retrieve sales by product",
        details: err.message,
      });
    }
    res.json(rows);
  });
});

router.get("/sales-by-customer", (req, res) => {
  const { startDate, endDate } = req.query;

  let query = `
    SELECT 
      Consuments.name as customer_name,
      SUM(price_sell * amount_yard) as total_sales,
      COUNT(Items_Sold.id) as total_transactions
    FROM Items_Sold
    JOIN Transactions ON Items_Sold.id_transaction = Transactions.id
    JOIN Consuments ON Transactions.id_consument = Consuments.id
    WHERE Transactions.status = 'success'
  `;

  if (startDate && endDate) {
    query += `
      AND DATE(Transactions.date) >= ?
      AND DATE(Transactions.date) <= ?
    `;
  }

  query += " GROUP BY Consuments.name";

  const params = startDate && endDate ? [startDate, endDate] : [];

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to retrieve sales by customer",
        details: err.message,
      });
    }
    res.json(rows);
  });
});

router.get("/product-ranking", (req, res) => {
  const { startDate, endDate, rankingBy } = req.query;

  // Default ranking criteria
  let rankingColumn = "SUM(amount_pcs)";
  let rankingLabel = "Total Units Sold";

  // Determine the ranking criteria
  if (rankingBy === "amount_yard") {
    rankingColumn = "SUM(amount_yard)";
    rankingLabel = "Total Yards Sold";
  } else if (rankingBy === "total_sales") {
    rankingColumn = "SUM(price_sell * amount_yard)";
    rankingLabel = "Total Sales Value";
  }

  let query = `
    SELECT 
      Items_Sold.name,
      ${rankingColumn} as ranking_value
    FROM Items_Sold
    JOIN Transactions ON Items_Sold.id_transaction = Transactions.id
    WHERE Transactions.status = 'success'
  `;

  // Add date filtering if provided
  if (startDate && endDate) {
    query += `
      AND DATE(Transactions.date) >= ?
      AND DATE(Transactions.date) <= ?
    `;
  }

  query += " GROUP BY Items_Sold.name ORDER BY ranking_value DESC";

  const params = startDate && endDate ? [startDate, endDate] : [];

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to retrieve product ranking",
        details: err.message,
      });
    }
    res.json({
      rankingCriteria: rankingLabel,
      products: rows,
    });
  });
});

router.get("/customer-ranking", (req, res) => {
  let query = `
    SELECT 
      Consuments.name as customer_name,
      COUNT(DISTINCT Transactions.id) as total_transactions,
      COUNT(Return.id) as total_returns
    FROM Consuments
    LEFT JOIN Transactions ON Transactions.id_consument = Consuments.id
    LEFT JOIN Return ON Return.id_consument = Consuments.id
    WHERE Transactions.status = 'success'
  `;

  query += `
    GROUP BY Consuments.name
    ORDER BY total_transactions DESC, total_returns ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to retrieve customer ranking",
        details: err.message,
      });
    }
    res.json(rows);
  });
});

router.get("/profit", (req, res) => {
  const { startDate, endDate } = req.query;

  let profitQuery = `
    SELECT 
      SUM(Transactions.advantage) as total_profit
    FROM Transactions
    WHERE Transactions.status = 'success'
  `;

  let capitalQuery = `
    SELECT 
      SUM(Transactions.capital) as total_capital
    FROM Transactions
    WHERE Transactions.status = 'success'
  `;

  if (startDate && endDate) {
    profitQuery += `
      AND DATE(Transactions.date) >= ?
      AND DATE(Transactions.date) <= ?
    `;
    capitalQuery += `
      AND DATE(Transactions.date) >= ?
      AND DATE(Transactions.date) <= ?
    `;
  }

  const params = startDate && endDate ? [startDate, endDate] : [];

  db.serialize(() => {
    let profitResult;
    let capitalResult;

    // Execute profit query
    db.get(profitQuery, params, (err, row) => {
      if (err) {
        return res.status(500).json({
          error: "Failed to retrieve profit analysis",
          details: err.message,
        });
      }
      profitResult = row.total_profit;

      // Execute capital query
      db.get(capitalQuery, params, (err, row) => {
        if (err) {
          return res.status(500).json({
            error: "Failed to retrieve capital analysis",
            details: err.message,
          });
        }
        capitalResult = row.total_capital;

        // Calculate net profit
        const netProfit = profitResult - capitalResult;

        // Return the results
        res.json({
          total_profit: profitResult,
          total_capital: capitalResult,
          net_profit: netProfit,
        });
      });
    });
  });
});

module.exports = router;
