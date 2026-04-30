require("dotenv").config();
const fs = require("fs");
const pool = require("./src/config/db");

async function applySchema() {
  try {
    const schema = fs.readFileSync("./db/schema.sql", "utf8");
    await pool.query(schema);
    console.log("✅ Database schema applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error applying schema:", error.message);
    process.exit(1);
  }
}

applySchema();
