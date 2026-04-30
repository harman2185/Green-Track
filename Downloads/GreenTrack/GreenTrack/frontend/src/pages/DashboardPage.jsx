import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function formatNumber(value) {
 return Number(value || 0).toFixed(2);
}

function DashboardPage() {
 const navigate = useNavigate();
 const { logout } = useAuth();
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [trips, setTrips] = useState([]);
 const [totals, setTotals] = useState(null);

 useEffect(() => {
  async function loadDashboard() {
   setLoading(true);
   setError("");
   try {
    const response = await api.get("/trips/dashboard");
    setTrips(response.data.trips || []);
    setTotals(response.data.totals || null);
   } catch (apiError) {
    setError(apiError?.response?.data?.message || "Failed to load dashboard.");
   } finally {
    setLoading(false);
   }
  }

  loadDashboard();
 }, []);

 return (
  <div className="page dashboard-layout">
   <header className="top-nav">
    <div>
     <h1>Dashboard</h1>
     <p>All saved shortest routes and accumulated sustainability impact.</p>
    </div>
    <div className="nav-actions">
     <Link className="outline-btn" to="/planner">
      New Trip
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

   {loading ? <p className="status-text">Loading dashboard...</p> : null}
   {error ? <p className="error-text">{error}</p> : null}

   {totals ? (
    <section className="kpi-grid">
     <div className="kpi-card">
      <p>Total Shortest Distance</p>
      <strong>{formatNumber(totals.total_distance)} km</strong>
     </div>
     <div className="kpi-card">
      <p>Total Fuel Used</p>
      <strong>{formatNumber(totals.total_fuel_used)} L</strong>
     </div>
     <div className="kpi-card">
      <p>Total CO2 Emitted</p>
      <strong>{formatNumber(totals.total_carbon)} kg</strong>
     </div>
     <div className="kpi-card positive">
      <p>Total Fuel Saved</p>
      <strong>{formatNumber(totals.total_fuel_saved)} L</strong>
     </div>
     <div className="kpi-card positive">
      <p>Total CO2 Saved</p>
      <strong>{formatNumber(totals.total_carbon_saved)} kg</strong>
     </div>
     <div className="kpi-card positive">
      <p>Total Distance Saved</p>
      <strong>{formatNumber(totals.total_distance_saved)} km</strong>
     </div>
    </section>
   ) : null}

   <section className="card table-card">
    <h2>Saved Trips</h2>
    {trips.length === 0 ? <p className="status-text">No trips saved yet.</p> : null}
    {trips.length > 0 ? (
     <div className="table-wrap">
      <table>
       <thead>
        <tr>
         <th>Date</th>
         <th>Pickup</th>
         <th>Drop</th>
         <th>Vehicle</th>
         <th>Distance (km)</th>
         <th>Fuel Saved (L)</th>
         <th>CO2 Saved (kg)</th>
        </tr>
       </thead>
       <tbody>
        {trips.map((trip) => (
         <tr key={trip.id}>
          <td>{new Date(trip.created_at).toLocaleDateString()}</td>
          <td>{trip.pickup_address}</td>
          <td>{trip.drop_address}</td>
          <td>{trip.vehicle_type}</td>
          <td>{formatNumber(trip.shortest_distance_km)}</td>
          <td>{formatNumber(trip.fuel_saved_liters)}</td>
          <td>{formatNumber(trip.carbon_saved_kg)}</td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    ) : null}
   </section>
  </div>
 );
}

export default DashboardPage;
