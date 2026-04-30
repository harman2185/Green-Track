const { Pool } = require("pg");

async function createDatabase() {
  const pool = new Pool({
    user: "postgres",
    password: "Deepharman.21",
    host: "localhost",
    port: 5432,
  });

  try {
    // Check if database exists
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'greentrack'"
    );

    if (result.rows.length === 0) {
      console.log("Creating database 'greentrack'...");
      await pool.query("CREATE DATABASE greentrack");
      console.log("✅ Database 'greentrack' created successfully!");
    } else {
      console.log("✅ Database 'greentrack' already exists");
    }

    await pool.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createDatabase();
