# GreenTrack

GreenTrack is a modern light-themed web app that helps you plan trips for both loading vehicles and small vehicles, find the shortest route, and measure fuel and carbon impact.

## Tech Stack

- Frontend: React + Vite + React Router + Leaflet
- Backend: Node.js + Express + PostgreSQL
- Routing/Map data: OSRM + OpenStreetMap (Leaflet)

## Features

- Login / Signup authentication with JWT
- Pickup and drop location input
- Route calculation using a shortest-route strategy
- Carbon/fuel algorithm for vehicle types:
  - Small Vehicle
  - Loading Vehicle
- Metrics shown for each trip:
  - Shortest distance
  - Fuel consumed
  - Carbon emitted
  - Fuel saved
  - Carbon saved
  - Distance saved
- Save trips and review all records in dashboard with totals

## Project Structure

- `frontend/` React app
- `backend/` Express API and PostgreSQL logic
- `backend/db/schema.sql` database schema
- `docker-compose.yml` local PostgreSQL setup

## Local Setup

1. Start PostgreSQL

```bash
  docker compose up -d
```

2. Configure backend env

```bash
cd backend
cp .env.example .env
```

3. Apply database schema

```bash
psql postgresql://postgres:postgres@localhost:5432/greentrack -f db/schema.sql
```

4. Run backend

```bash
cd backend
npm install
npm run dev
```

5. Configure frontend env

```bash
cd frontend
cp .env.example .env
```

6. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:5050

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/trips/calculate` (auth required)
- `POST /api/trips/save` (auth required)
- `GET /api/trips/dashboard` (auth required)

## Algorithm Notes

- The app requests route alternatives from OSRM.
- It selects the shortest route as the optimized path.
- Emission model:
  - Fuel = distance_km * vehicle_fuel_per_km
  - CO2 = fuel_liters * kg_co2_per_liter
- Baseline is the longest alternative route returned by OSRM for the same points.
- Savings are reported as baseline minus shortest route.
