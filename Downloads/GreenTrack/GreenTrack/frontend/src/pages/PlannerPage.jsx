import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

async function geocodeAddress(address) {
 const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
 );
 const data = await response.json();

 if (!Array.isArray(data) || data.length === 0) {
  throw new Error(`Location not found: ${address}`);
 }

 return {
  lat: Number(data[0].lat),
  lng: Number(data[0].lon),
  label: data[0].display_name,
 };
}

function PlannerPage() {
 const navigate = useNavigate();
 const { user, logout } = useAuth();
 const [pickupAddress, setPickupAddress] = useState("");
 const [dropAddress, setDropAddress] = useState("");
 const [vehicleType, setVehicleType] = useState("small");
 const [isCalculating, setIsCalculating] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [error, setError] = useState("");
 const [result, setResult] = useState(null);

 const polyline = useMemo(() => {
  if (!result?.route?.geometry?.coordinates) {
   return [];
  }
  return result.route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
 }, [result]);

 const pickupCoords = result?.pickupCoords;
 const dropCoords = result?.dropCoords;
 const mapCenter = pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : [20.5937, 78.9629];

 const handleCalculate = async (event) => {
  event.preventDefault();
  setError("");
  setIsCalculating(true);
  setResult(null);

  try {
   const [pickup, drop] = await Promise.all([
    geocodeAddress(pickupAddress),
    geocodeAddress(dropAddress),
   ]);

   const response = await api.post("/trips/calculate", {
    pickup: { lat: pickup.lat, lng: pickup.lng },
    drop: { lat: drop.lat, lng: drop.lng },
    vehicleType,
   });

   setResult({
    ...response.data,
    pickupCoords: { lat: pickup.lat, lng: pickup.lng },
    dropCoords: { lat: drop.lat, lng: drop.lng },
    pickupLabel: pickup.label,
    dropLabel: drop.label,
   });
  } catch (apiError) {
   setError(apiError?.response?.data?.message || apiError.message || "Failed to calculate route.");
  } finally {
   setIsCalculating(false);
  }
 };

 const handleSave = async () => {
  if (!result) {
   return;
  }

  setIsSaving(true);
  setError("");

  try {
   await api.post("/trips/save", {
    pickupAddress: result.pickupLabel,
    dropAddress: result.dropLabel,
    pickupCoords: result.pickupCoords,
    dropCoords: result.dropCoords,
    vehicleType,
    routeResult: result,
   });
   navigate("/dashboard");
  } catch (apiError) {
   setError(apiError?.response?.data?.message || "Failed to save trip.");
  } finally {
   setIsSaving(false);
  }
 };

 return (
  <div className="page planner-layout">
   <header className="top-nav">
    <div>
     <h1>Route Planner</h1>
     <p>Welcome, {user?.name || "Driver"}. Track low-emission path decisions here.</p>
    </div>
    <div className="nav-actions">
     <Link className="outline-btn" to="/dashboard">
      Dashboard
     </Link>
     <button
      className="outline-btn"
      onClick={() => {
       logout();
       navigate("/auth");
      }}
     >
      Logout
     </button>
    </div>
   </header>

   <section className="planner-grid">
    <aside className="card planner-card">
     <h2>Plan A Trip</h2>
     <form onSubmit={handleCalculate} className="planner-form">
      <label>
       Pickup Location
       <input
        required
        value={pickupAddress}
        onChange={(e) => setPickupAddress(e.target.value)}
        placeholder="e.g. Andheri East, Mumbai"
       />
      </label>

      <label>
       Drop Location
       <input
        required
        value={dropAddress}
        onChange={(e) => setDropAddress(e.target.value)}
        placeholder="e.g. Navi Mumbai"
       />
      </label>

      <label>
       Vehicle Type
       <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
        <option value="small">Small Vehicle</option>
        <option value="loading">Loading Vehicle</option>
       </select>
      </label>

      <button className="primary-btn" type="submit" disabled={isCalculating}>
       {isCalculating ? "Calculating..." : "Find Shortest Low-Carbon Route"}
      </button>
     </form>

     {error ? <p className="error-text">{error}</p> : null}

     {result ? (
      <div className="result-stack">
       <h3>Trip Insights</h3>
       <div className="insight-row">
        <span>Shortest Distance</span>
        <strong>{result.metrics.best.distanceKm} km</strong>
       </div>
       <div className="insight-row">
        <span>Fuel Use (Shortest Route)</span>
        <strong>{result.metrics.best.fuelLiters} L</strong>
       </div>
       <div className="insight-row">
        <span>CO2 Emission</span>
        <strong>{result.metrics.best.carbonKg} kg</strong>
       </div>
       <div className="insight-row success">
        <span>Distance Saved</span>
        <strong>{result.metrics.savings.distanceKm} km</strong>
       </div>
       <div className="insight-row success">
        <span>Fuel Saved</span>
        <strong>{result.metrics.savings.fuelLiters} L</strong>
       </div>
       <div className="insight-row success">
        <span>CO2 Saved</span>
        <strong>{result.metrics.savings.carbonKg} kg</strong>
       </div>
       <button className="secondary-btn" type="button" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save To Dashboard"}
       </button>
      </div>
     ) : null}
    </aside>

    <article className="card map-card">
     <MapContainer center={mapCenter} zoom={11} className="map-view" scrollWheelZoom>
      <TileLayer
       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pickupCoords ? (
       <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
        <Popup>Pickup</Popup>
       </Marker>
      ) : null}

      {dropCoords ? (
       <Marker position={[dropCoords.lat, dropCoords.lng]}>
        <Popup>Drop</Popup>
       </Marker>
      ) : null}

      {polyline.length > 0 ? <Polyline positions={polyline} color="#0f766e" weight={5} /> : null}
     </MapContainer>
    </article>
   </section>
  </div>
 );
}

export default PlannerPage;
