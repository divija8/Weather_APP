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
      endDate,
      temperature,
      humidity,
      condition,
      windSpeed,
      coordinates,
    } = req.body;

    // ✅ Validate required fields
    if (!location || !startDate || !endDate || !coordinates) {
      return res
        .status(400)
        .json({ message: "Location, date range, and coordinates are required." });
    }

    // ✅ Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "Start date cannot be after end date." });
    }

    // ✅ Validate coordinate ranges
    const { lat, lon } = coordinates;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        message: "Latitude must be between -90 and 90, and longitude between -180 and 180.",
      });
    }

    // ✅ Validate coordinates via Open-Meteo
    const verifyRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.current_weather) {
      return res
        .status(400)
        .json({ message: "Invalid coordinates: no weather data found." });
    }

    // ✅ Create record
    const newSearch = new WeatherSearch({
      location,
      startDate,
      endDate,
      temperature,
      humidity,
      condition,
      windSpeed,
      coordinates,
    });

    const saved = await newSearch.save();
    res.status(201).json(saved);
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