import React from "react";
import "./WeatherCard.css";

function WeatherCard({ data }) {
  return (
    <div className="weather-card">
      <h2>{data.name}</h2>
      <p>Temperature: {data.temp} °C</p>
      <p>Wind: {data.wind} km/h</p>
      <p>{data.desc}</p>
    </div>
  );
}

export default WeatherCard;