# 🌤 Weather App &mdash; PM Accelerator Tech Assessments 1 & 2

Full-stack weather experience built with a **React** frontend and a **Node.js/Express** backend backed by **MongoDB**. The app demonstrates the PM Accelerator requirements: real-time weather lookup, CRUD persistence for historical queries, third-party integrations, and export utilities.

## 🔍 Overview

- **Frontend:** React + React Scripts, Axios, custom components.
- **Backend:** Express, Mongoose, Open-Meteo APIs, Nominatim geocoding.
- **Database:** MongoDB Atlas (or any MongoDB instance).
- **Integrations:** YouTube Data API (videos), Google Maps Embed (maps).
- **Exports:** JSON and CSV downloads powered by client-side utilities.

## ✨ Features

### Tech Assessment 1 Highlights
- Multiple input formats: city name, ZIP/landmark, or `lat,lon` coordinates.
- Current weather with temperature, wind speed, and descriptive conditions via Open-Meteo.
- Toggle-based five-day forecast fetched on demand to minimize API calls.
- Geolocation shortcut that reverse-geocodes the user’s current position using Nominatim.
- Polished React UI with tabbed navigation and reusable weather card component.

### Tech Assessment 2 Enhancements
- **Persistent storage:** Saves daily archive data for a selected date range in MongoDB.
- **Complete CRUD:** Create, list, update, and delete saved weather records via REST API.
- **API integrations:** Embeds a related YouTube travel video and an interactive Google Map for the saved city.
- **Data export:** Download saved records as JSON or CSV directly from the browser.
- **Validation & error handling:** Server-side guardrails for dates, coordinates, and numeric ranges.

## 🏗 Architecture

```text
[ React SPA ]  --Axios-->  [ Express REST API ]  --Mongoose-->  [ MongoDB ]
      |                                 |
      |                                 ├── Open-Meteo Forecast API (current & forecast)
      |                                 ├── Open-Meteo Archive API (historical averages)
      |                                 └── Nominatim Geocoding (reverse/forward lookup)
      |
      └── Direct embeds: YouTube, Google Maps
```

## 📁 Folder Structure

```bash
Weather_App/
├── frontend/                 # React client
│   ├── src/
│   │   ├── App.js            # UI, tab routing, weather workflows
│   │   ├── components/       # WeatherCard + CRUD tabs
│   │   ├── services/         # YouTube + export utilities
│   │   └── App.css
│   └── package.json
├── backend/                  # Express API
│   ├── config/db.js          # Mongo connection helper
│   ├── models/WeatherSearch.js
│   ├── routes/weatherRoutes.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── ...other support files
└── README.md                 # You are here
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB URI (local or Atlas cluster)
- Optional: YouTube Data API v3 key for richer integrations

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
```ini
PORT=5001
MONGO_URI=your-mongodb-connection-string
```

Run the API (with auto-reload during development):
```bash
npm run dev
```
or production mode:
```bash
npm start
```
The server exposes REST endpoints on `http://localhost:5001`.

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```
Optional environment variable for integrations:
```ini
# frontend/.env
REACT_APP_YOUTUBE_API_KEY=your-youtube-data-api-key
```
When omitted, YouTube embeds gracefully fall back to placeholder messaging.

Start the React app:
```bash
npm start
```
The UI runs on `http://localhost:3000` and proxies API calls to the backend.

### Running the Full Stack
1. Boot the backend (port `5001` by default).
2. Start the frontend (port `3000`).
3. Visit `http://localhost:3000` in the browser.

Ensure MongoDB is reachable before launching the backend.

## 🔌 REST API Endpoints

| Method | Path                 | Description                              |
| ------ | -------------------- | ---------------------------------------- |
| GET    | `/`                  | Health check response                    |
| POST   | `/api/weather`       | Save archive weather data for a date span|
| GET    | `/api/weather`       | List all stored weather records          |
| GET    | `/api/weather/:id`   | Fetch a single record                    |
| PUT    | `/api/weather/:id`   | Update an existing record (validated)    |
| DELETE | `/api/weather/:id`   | Remove a record                          |

All POST requests require `location`, `startDate`, and `endDate`. The server geocodes the location, calls the Open-Meteo archive API, stores the results day-by-day, and returns the normalized payload to the frontend.

## 🧪 Testing

Automated tests are not yet configured. Suggested next steps:
- Add component tests with React Testing Library.
- Mock Open-Meteo requests for backend unit tests using Jest.
- Add integration smoke tests that cover the CRUD cycle.

## 🛠 Troubleshooting

- **Backend `.env` accidentally committed:** run `git rm --cached backend/.env`, commit the removal, and rely on `.env.example`.
- **Mongo connection fails:** confirm `MONGO_URI` is valid and IP whitelisting is configured for Atlas.
- **Integrations tab shows “No video found”:** verify the YouTube API key and quota; the request uses `REACT_APP_YOUTUBE_API_KEY`.
- **Forecast never loads:** the five-day forecast only fetches after the checkbox is enabled; this is expected to prevent unnecessary calls.

Built with ❤️ for the PM Accelerator AI Engineer bootcamp requirements.
