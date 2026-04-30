require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ message: "GreenTrack API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
