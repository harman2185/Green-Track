import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function AuthPage() {
 const navigate = useNavigate();
 const { login } = useAuth();
 const [mode, setMode] = useState("login");
 const [form, setForm] = useState({ name: "", email: "", password: "" });
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const isSignup = mode === "signup";

 const handleSubmit = async (event) => {
  event.preventDefault();
  setLoading(true);
  setError("");

  try {
   const endpoint = isSignup ? "/auth/signup" : "/auth/login";
   const payload = isSignup
    ? { name: form.name, email: form.email, password: form.password }
    : { email: form.email, password: form.password };

   const response = await api.post(endpoint, payload);
   login(response.data.token, response.data.user);
   navigate("/planner", { replace: true });
  } catch (apiError) {
   setError(apiError?.response?.data?.message || "Authentication failed.");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="page auth-layout">
   <section className="auth-panel">
    <div className="auth-header">
     <h1>GreenTrack</h1>
     <p>Plan cleaner routes and measure your carbon savings every trip.</p>
    </div>

    <div className="tab-strip">
     <button
      type="button"
      className={mode === "login" ? "tab active" : "tab"}
      onClick={() => setMode("login")}
     >
      Login
     </button>
     <button
      type="button"
      className={mode === "signup" ? "tab active" : "tab"}
      onClick={() => setMode("signup")}
     >
      Sign Up
     </button>
    </div>

    <form onSubmit={handleSubmit} className="auth-form">
     {isSignup ? (
      <label>
       Full Name
       <input
        required
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Aman Sharma"
       />
      </label>
     ) : null}

     <label>
      Email
      <input
       required
       type="email"
       value={form.email}
       onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
       placeholder="you@example.com"
      />
     </label>

     <label>
      Password
      <input
       required
       type="password"
       minLength={6}
       value={form.password}
       onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
       placeholder="At least 6 characters"
      />
     </label>

     {error ? <p className="error-text">{error}</p> : null}

     <button className="primary-btn" type="submit" disabled={loading}>
      {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
     </button>
    </form>

    <p className="auth-footnote">
     After login you can calculate shortest route, fuel use, and CO2 impact.
    </p>
   </section>

   <section className="promo-panel">
    <div className="promo-badge">Fleet Intelligence</div>
    <h2>From heavy loaders to small vehicles, choose the least emission route.</h2>
    <ul>
     <li>Interactive Leaflet map route preview</li>
     <li>Shortest path detection using route comparison algorithm</li>
     <li>Dashboard with saved trips and total fuel/carbon savings</li>
    </ul>
    <Link to="/planner" className="ghost-link">
     Continue as configured user
    </Link>
   </section>
  </div>
 );
}

export default AuthPage;
