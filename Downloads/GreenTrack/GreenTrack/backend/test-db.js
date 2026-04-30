const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/greentrack",
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Connection error:", err.message);
  } else {
    console.log("Connection successful! Current time:", res.rows[0].now);
  }
  process.exit(err ? 1 : 0);
});
