import express from "express";
import WeatherSearch from "../models/WeatherSearch.js";

const router = express.Router();

/* -----------------------------------------------------------
   POST /api/weather  →  CREATE a new weather record
------------------------------------------------------------ */
router.post("/", async (req, res) => {
  try {
    const {
      location,
      startDate,
      endDate
    } = req.body;
    console.log(location, startDate, endDate);
    // ✅ Validate required fields
    if (!location || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "location, startDate, endDate are required." });
    }
    console.log(location, startDate, endDate, "2");

    // ✅ Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "Start date cannot be after end date." });
    }
    console.log(location, startDate, endDate, "3");
    const geoRes = await fetch(
  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&addressdetails=1`,
  {
    headers: {
      "User-Agent": "weather-app/1.0 (swethasiri83@gmail.com)"
    }
  }
);
    console.log(location, startDate, endDate, "4", geoRes);

    const geoData = await geoRes.json();
    if (!geoData.length) {
      return res.status(400).json({ message: "Location not found." });
    }
    console.log(location, startDate, endDate, "5");
    const lat = geoData[0].lat;
    const lon = geoData[0].lon;
    console.log(lat, lon);
    // ✅ Fetch daily mean temperature from Open-Meteo archive API
    const apiUrl = `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean`;
    const apiRes = await fetch(apiUrl);
    const apiData = await apiRes.json();

    if (!apiRes.ok || !apiData.daily || !apiData.daily.time || !apiData.daily.temperature_2m_mean) {
      return res.status(400).json({ message: "Could not fetch weather data for given range." });
    }
    // console.log(apiRes)

    // Prepare records for DB and response
    const records = apiData.daily.time.map((day, idx) => ({
      location,
      date: day,
      temperature: apiData.daily.temperature_2m_mean[idx],
      coordinates: { lat, lon },
    }));
    console.log(records);
    // Store all records in DB
    const savedRecords = await WeatherSearch.insertMany(records);
    console.log(location, startDate, endDate, "7");

    // Prepare response: list of { day, temperature }
    const result = records.map(r => ({
      day: r.date,
      temperature: r.temperature,
    }));
    console.log(result)
    res.status(201).json({ location, coordinates: { lat, lon }, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving weather data", error: error.message });
  }
});

/* -----------------------------------------------------------
   GET /api/weather  →  READ all weather records
------------------------------------------------------------ */
router.get("/", async (_req, res) => {
  console.log("enterered");
  try {
    const searches = await WeatherSearch.find().sort({ searchedAt: -1 });
    res.status(200).json(searches);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching weather data", error: error.message });
  }
});

/* -----------------------------------------------------------
   GET /api/weather/:id  →  READ one record by ID
------------------------------------------------------------ */
router.get("/:id", async (req, res) => {
  try {
    const weather = await WeatherSearch.findById(req.params.id);
    if (!weather)
      return res.status(404).json({ message: "Weather record not found" });
    res.status(200).json(weather);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching specific record", error: error.message });
  }
});

/* -----------------------------------------------------------
   PUT /api/weather/:id  →  UPDATE record with validation
------------------------------------------------------------ */
router.put("/:id", async (req, res) => {
  try {
    const {
      location,
      temperature,
      humidity,
      condition,
      windSpeed,
      coordinates,
    } = req.body;

    // ✅ Range validations
    if (temperature && (temperature < -100 || temperature > 100))
      return res.status(400).json({ message: "Temperature must be between -100 and 100°C." });
    if (humidity && (humidity < 0 || humidity > 100))
      return res.status(400).json({ message: "Humidity must be between 0 and 100%." });
    if (windSpeed && windSpeed < 0)
      return res.status(400).json({ message: "Wind speed cannot be negative." });

    // ✅ Coordinate validation (only if coordinates are sent)
    if (coordinates) {
      const { lat, lon } = coordinates;
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          message: "Latitude must be between -90 and 90, and longitude between -180 and 180.",
        });
      }
      const verifyRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.current_weather) {
        return res
          .status(400)
          .json({ message: "Invalid coordinates: no weather data found." });
      }
    }

    // ✅ Allowed fields only
    const updateFields = {};
    if (location) updateFields.location = location;
    if (temperature) updateFields.temperature = temperature;
    if (humidity) updateFields.humidity = humidity;
    if (condition) updateFields.condition = condition;
    if (windSpeed) updateFields.windSpeed = windSpeed;
    if (coordinates) updateFields.coordinates = coordinates;

    const updated = await WeatherSearch.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Weather record not found" });

    res.status(200).json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating weather record", error: error.message });
  }
});

/* -----------------------------------------------------------
   DELETE /api/weather/:id  →  DELETE record
------------------------------------------------------------ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await WeatherSearch.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Weather record not found" });
    res.status(200).json({ message: "Weather record deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting weather record", error: error.message });
  }
});

export default router;