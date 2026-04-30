const VEHICLE_FACTORS = {
  small: {
    label: "Small Vehicle",
    fuelPerKm: 0.07,
    co2KgPerLiter: 2.31,
  },
  loading: {
    label: "Loading Vehicle",
    fuelPerKm: 0.22,
    co2KgPerLiter: 2.68,
  },
};

function round(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function computeMetrics(distanceMeters, factor) {
  const distanceKm = distanceMeters / 1000;
  const fuelLiters = distanceKm * factor.fuelPerKm;
  const carbonKg = fuelLiters * factor.co2KgPerLiter;

  return {
    distanceKm: round(distanceKm),
    fuelLiters: round(fuelLiters),
    carbonKg: round(carbonKg),
  };
}

function compareRoutes({ bestDistanceMeters, baselineDistanceMeters, vehicleType }) {
  const factor = VEHICLE_FACTORS[vehicleType] || VEHICLE_FACTORS.small;

  const best = computeMetrics(bestDistanceMeters, factor);
  const baseline = computeMetrics(baselineDistanceMeters, factor);

  return {
    vehicleType,
    vehicleLabel: factor.label,
    best,
    baseline,
    savings: {
      distanceKm: round(Math.max(0, baseline.distanceKm - best.distanceKm)),
      fuelLiters: round(Math.max(0, baseline.fuelLiters - best.fuelLiters)),
      carbonKg: round(Math.max(0, baseline.carbonKg - best.carbonKg)),
    },
  };
}

module.exports = {
  VEHICLE_FACTORS,
  compareRoutes,
};
