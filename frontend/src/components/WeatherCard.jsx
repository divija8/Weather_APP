import "./WeatherCard.css";

export default function WeatherCard({ data }) {
  const { name, main, weather, wind } = data;
  return (
    <div className="weather-card">
      <h2>{name}</h2>
      <img
        src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
        alt={weather[0].description}
      />
      <p>🌡 Temperature: {main.temp} °C</p>
      <p>💧 Humidity: {main.humidity}%</p>
      <p>🌬 Wind: {wind.speed} m/s</p>
      <p>☁️ Condition: {weather[0].description}</p>
    </div>
  );
}