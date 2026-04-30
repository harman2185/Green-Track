CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    pickup_address TEXT NOT NULL,
    drop_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    drop_lat DOUBLE PRECISION NOT NULL,
    drop_lng DOUBLE PRECISION NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    shortest_distance_km NUMERIC(10, 2) NOT NULL,
    fuel_used_liters NUMERIC(10, 2) NOT NULL,
    carbon_emission_kg NUMERIC(10, 2) NOT NULL,
    fuel_saved_liters NUMERIC(10, 2) NOT NULL,
    carbon_saved_kg NUMERIC(10, 2) NOT NULL,
    distance_saved_km NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);