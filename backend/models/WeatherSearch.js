import mongoose from "mongoose";

const WeatherSearchSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    temperature: Number,
    humidity: Number,
    condition: String,
    windSpeed: Number,
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
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