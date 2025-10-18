import mongoose from "mongoose";

const WeatherSearchSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // ISO date string, e.g., '2025-10-12'
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    coordinates: {
      lat: { type: String, required: true },
      lon: { type: String, required: true },
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "weather_searches" }
);

const WeatherSearch = mongoose.model("WeatherSearch", WeatherSearchSchema);
export default WeatherSearch;