const express = require("express");
const axios = require("axios");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");
const { compareRoutes, VEHICLE_FACTORS } = require("../utils/emissions");

const router = express.Router();

router.use(authMiddleware);

router.post("/calculate", async (req, res) => {
  const { pickup, drop, vehicleType } = req.body;

  if (!pickup || !drop || typeof pickup.lat !== "number" || typeof pickup.lng !== "number" || typeof drop.lat !== "number" || typeof drop.lng !== "number") {
    return res.status(400).json({ message: "Valid pickup and drop coordinates are required." });
  }

  const selectedVehicleType = VEHICLE_FACTORS[vehicleType] ? vehicleType : "small";

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}`;
    const response = await axios.get(url, {
      params: {
        alternatives: true,
        geometries: "geojson",
        overview: "full",
        steps: false,
      },
    });

    const routes = response.data?.routes || [];
    if (routes.length === 0) {
      return res.status(404).json({ message: "No route found for the selected locations." });
    }

    const sortedByDistance = [...routes].sort((a, b) => a.distance - b.distance);
    const bestRoute = sortedByDistance[0];
    const baselineRoute = sortedByDistance[sortedByDistance.length - 1];

    const metrics = compareRoutes({
      bestDistanceMeters: bestRoute.distance,
      baselineDistanceMeters: baselineRoute.distance,
      vehicleType: selectedVehicleType,
    });

    return res.json({
      route: {
        distanceMeters: bestRoute.distance,
        durationSeconds: bestRoute.duration,
        geometry: bestRoute.geometry,
      },
      baseline: {
        distanceMeters: baselineRoute.distance,
      },
      metrics,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to calculate route.", error: error.message });
  }
});

router.post("/save", async (req, res) => {
  const { pickupAddress, dropAddress, pickupCoords, dropCoords, vehicleType, routeResult } = req.body;

  if (!pickupAddress || !dropAddress || !pickupCoords || !dropCoords || !routeResult) {
    return res.status(400).json({ message: "Missing trip data." });
  }

  try {
    const insertQuery = `
      INSERT INTO trips (
        user_id,
        pickup_address,
        drop_address,
        pickup_lat,
        pickup_lng,
        drop_lat,
        drop_lng,
        vehicle_type,
        shortest_distance_km,
        fuel_used_liters,
        carbon_emission_kg,
        fuel_saved_liters,
        carbon_saved_kg,
        distance_saved_km
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `;

    const values = [
      req.user.userId,
      pickupAddress,
      dropAddress,
      pickupCoords.lat,
      pickupCoords.lng,
      dropCoords.lat,
      dropCoords.lng,
      routeResult.metrics.vehicleType,
      routeResult.metrics.best.distanceKm,
      routeResult.metrics.best.fuelLiters,
      routeResult.metrics.best.carbonKg,
      routeResult.metrics.savings.fuelLiters,
      routeResult.metrics.savings.carbonKg,
      routeResult.metrics.savings.distanceKm,
    ];

    const result = await pool.query(insertQuery, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save trip.", error: error.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const tripsResult = await pool.query(
      "SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId]
    );

    const totalsResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(shortest_distance_km), 0) AS total_distance,
        COALESCE(SUM(fuel_used_liters), 0) AS total_fuel_used,
        COALESCE(SUM(carbon_emission_kg), 0) AS total_carbon,
        COALESCE(SUM(fuel_saved_liters), 0) AS total_fuel_saved,
        COALESCE(SUM(carbon_saved_kg), 0) AS total_carbon_saved,
        COALESCE(SUM(distance_saved_km), 0) AS total_distance_saved
      FROM trips
      WHERE user_id = $1
      `,
      [req.user.userId]
    );

    return res.json({
      trips: tripsResult.rows,
      totals: totalsResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard.", error: error.message });
  }
});

module.exports = router;
