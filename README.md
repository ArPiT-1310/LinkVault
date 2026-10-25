# LinkVault client (React + Vite)

## Run
    npm install
    npm run dev          # http://localhost:5173

In development, `/api/*` is proxied to `http://localhost:8080` (see vite.config.js).
For production, copy `.env.example` to `.env` and set `VITE_API_URL`.

## Connecting the backend
All HTTP calls live in `src/api/services.js`. The expected request/response
shapes are documented at the top of that file. If your Spring Boot DTOs differ,
change them there and nowhere else.
