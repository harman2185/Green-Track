const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "greentrack",
  user: "postgres",
  // No password - for trust authentication
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Connection error:", err.message);
  } else {
    console.log("Connection successful! Current time:", res.rows[0].now);
  }
  process.exit(err ? 1 : 0);
});
