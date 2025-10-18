import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import WeatherCard from "./components/WeatherCard";

function App() {
  const [city, setCity] = useState("");
  const [city2, setCity2] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [tab, setTab] = useState("create");
  const [weatherRecords, setWeatherRecords] = useState([]);
  // Integration tab state
  const [integrationTab, setIntegrationTab] = useState("maps");

  // task-2 fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [savedWeather, setSavedWeather] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editTemp, setEditTemp] = useState("");

  const codeMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    71: "Snow fall",
    80: "Rain showers",
    95: "Thunderstorm",
  };

  const getWeather = async () => {
    if (!city.trim()) return setError("Please enter a location.");

    setError("");
    setLoading(true);
    setWeather(null);
    setForecast(null);

    try {
      let lat, lon, name;

      const input = city.trim();
      const parts = input.split(",").map((p) => p.trim());

      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // Coordinates input: "lat,lon"
        lat = parts[0];
        lon = parts[1];

        // Reverse geocode to get name
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const geoData = await geoRes.json();
        name =
          geoData.address.city ||
          geoData.address.town ||
          geoData.address.village ||
          geoData.display_name ||
          "Your Coordinates";
        name = name + "\n(" + lat + ", " + lon + ")";
      } else {
        // Free text (zip, city, landmark)
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=1`
        );
        const geoData = await geoRes.json();
        if (!geoData.length) throw new Error("Location not found.");
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        const address = geoData[0].address || {};
        name =
          address.city ||
          address.town ||
          address.village ||
          address.hamlet ||
          geoData[0].display_name.split(",")[0];
      }

      await fetchWeather(lat, lon, name);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon, name = "Location") => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();
      setWeather({
        name,
        temp: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
        desc: codeMap[data.current_weather.weathercode] || "Unknown",
        lat,
        lon,
      });
      getForecast(lat, lon);
    } catch {
      setError("Unable to fetch weather data.");
    }
  };

  const getForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=5&timezone=auto`
      );
      const data = await res.json();
      const days = data.daily.time.map((d, i) => ({
        date: d,
        avgTemp: (
          (data.daily.temperature_2m_max[i] +
            data.daily.temperature_2m_min[i]) /
          2
        ).toFixed(1),
        desc: codeMap[data.daily.weathercode[i]] || "Unknown",
      }));
      setForecast(days);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveWeather = async () => {
    if (!startDate || !endDate || !city2)
      return alert("Please fill start/end dates and location.");

    setLoading(true);
    setError("");
    setSavedWeather(null);

    try {
      const data = {
        location: city2,
        startDate,
        endDate,
      };

      const response = await axios.post('http://localhost:5001/api/weather', data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setLoading(false);

      if (response.status === 201 && response.data && response.data.data) {
        setSavedWeather(response.data.data); // <-- Save the returned list
        alert("Weather data saved successfully");
      } else {
        setError(response.data.message || "Error saving data");
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "Failed to save weather data");
      setSavedWeather(null);
      console.error("❌ Error in saving weather:", error.response?.data || error.message);
    }
  };

  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported.");
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // await fetchWeather(latitude,longitude,"Your Location");
        // Reverse geocoding using OpenStreetMap's Nominatim
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geoData = await geoRes.json();
          const locationName =
            geoData.address.city ||
            geoData.address.town ||
            geoData.address.village ||
            "Your Location";

          await fetchWeather(latitude, longitude, locationName);
        } catch (e) {
          await fetchWeather(latitude, longitude, "Your Location");
        }

        setLoading(false);
      },
      () => {
        setError("Unable to get your location.");
        setLoading(false);
      }
    );
  };

  const [videoId, setVideoId] = useState(null);

const fetchYouTubeVideo = async (query) => {
  try {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    console.log(API_KEY);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
        query
      )}&maxResults=1&videoEmbeddable=true&key=${API_KEY}`
    );
    console.log(res, "1");
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      setVideoId(data.items[0].id.videoId);
    } else {
      setVideoId(null);
    }
  } catch (error) {
    console.error("Error fetching YouTube video:", error);
    setVideoId(null);
  }
};

  const fetchWeatherData = async () => {
  try {
    const res = await fetch("http://localhost:5001/api/weather");
    const data = await res.json();
    if (res.ok) {
      setWeatherRecords(data);
    } else {
      alert("Error fetching data: " + data.message);
    }
  } catch (err) {
    alert("Network error while fetching weather data");
    console.error(err);
  }
};

const startEdit = (record) => {
  setEditingRecord(record._id);
  setEditTemp(record.temperature);
};
const saveEdit = async (recordId) => {
  try {
    const response = await fetch(`http://localhost:5001/api/weather/${recordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ temperature: parseFloat(editTemp) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || "Failed to update temperature");
      return;
    }

    const updatedRecord = await response.json();

    // Update record in state
    setWeatherRecords((prevRecords) =>
      prevRecords.map((r) => (r._id === recordId ? updatedRecord : r))
    );

    setEditingRecord(null);
    setEditTemp("");
  } catch (err) {
    console.error("Update error:", err);
    alert("An error occurred while updating the record.");
  }
};
const handleDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to delete this record?");
  if (!confirm) return;

  try {
    const res = await fetch(`http://localhost:5001/api/weather/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      setWeatherRecords(prev => prev.filter(record => record._id !== id));
      alert("Record deleted successfully");
    } else {
      const data = await res.json();
      alert("Error deleting record: " + data.message);
    }
  } catch (err) {
    console.error("❌ Delete error:", err);
    alert("Network error while deleting record.");
  }
};
  return (
    <div className="app-container">
      <h1>🌦 Weather App</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter city, ZIP, landmark, or GPS (lat,lon)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="location-input"
        />
        {/* <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} /> */}
        <button onClick={getWeather}>Get Weather</button>
        <button onClick={getCurrentLocationWeather}>📍 Use My Location</button>
        {/* <button className="save-btn" onClick={handleSaveWeather}>💾 Save to Database</button> */}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && <WeatherCard data={weather} />}

      {weather && (
        <div className="forecast-toggle">
          <input
            type="checkbox"
            checked={!!forecast}
            onChange={(e) =>
              e.target.checked
                ? getForecast(weather.lat, weather.lon)
                : setForecast(null)
            }
          />
          <span>Show 5-Day Forecast</span>
        </div>
      )}
      {forecast && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-cards">
            {forecast.map((d) => (
              <div key={d.date} className="forecast-card">
                <p className="forecast-date">{d.date}</p>
                <p className="forecast-temp">{d.avgTemp} °C</p>
                <p className="forecast-desc">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="crud-section">
  <h2>Weather Data Management</h2>
  <div className="tabs">
    <button onClick={() => setTab("create")} className={tab === "create" ? "active-tab" : ""}>CREATE</button>
    <button onClick={() => { setTab("read"); fetchWeatherData(); }} className={tab === "read" ? "active-tab" : ""}>READ</button>
    <button onClick={() => setTab("update")} className={tab === "update" ? "active-tab" : ""}>UPDATE</button>
    <button onClick={() => {setTab("delete");fetchWeatherData(); }}className={tab === "delete" ? "active-tab" : ""}>DELETE</button>
    {/* <button onClick={() => setTab("integrations")} className={tab === "integrations" ? "active-tab" : ""}>INTEGRATIONS</button> */}
    <button onClick={() => setTab("integrations")} className={tab === "integrations" ? "active-tab" : ""}>INTEGRATIONS</button>
    <button onClick={() => setTab("export")} className={tab === "export" ? "active-tab" : ""}>EXPORT</button>
  </div>

  {/* CREATE tab */}
  {tab === "create" && (
    <div className="crud-create">
      <h4>Save query details to DB</h4>
      <div className="crud-fields">
        <input
          type="text"
          placeholder="Location for DB save"
          value={city2}
          onChange={(e) => setCity2(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleSaveWeather}>Save Weather Data</button>
      </div>
      {/* Display saved weather records */}
      {savedWeather && (
        <div className="saved-weather-list">
          <h4>Saved Daily Temperatures</h4>
          <ul>
            {savedWeather.map((item) => (
              <li key={item.day}>
                {item.day}: {item.temperature} °C
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )}

  {/* READ tab */}
  {tab === "read" && (
    <div className="crud-read">
      <h2>Saved Weather Records</h2>
      {weatherRecords.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Date</th>
              <th>Temperature (°C)</th>
              <th>Latitude</th>
              <th>Longitude</th>
            </tr>
          </thead>
          <tbody>
            {weatherRecords.map((record) => (
              <tr key={record._id}>
                <td>{record.location}</td>
                <td>{record.date}</td>
                <td>{record.temperature}</td>
                <td>{record.coordinates?.lat}</td>
                <td>{record.coordinates?.lon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )}
 {/* UPDATE tab */}
  {tab === "update" && (
  <>
    <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
      Update Saved Weather Record
    </h3>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Location</th>
          <th>Date</th>
          <th>Temperature (°C)</th>
          <th>Latitude</th>
          <th>Longitude</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {weatherRecords.map((record) => (
          <tr key={record._id}>
            <td>{record.location}</td>
            <td>{record.date}</td>
            <td>
              {editingRecord === record._id ? (
                <input
                  type="number"
                  value={editTemp}
                  onChange={(e) => setEditTemp(e.target.value)}
                  style={{ width: "80px" }}
                />
              ) : (
                record.temperature
              )}
            </td>
            <td>{record.coordinates?.lat}</td>
            <td>{record.coordinates?.lon}</td>
            <td>
              {editingRecord === record._id ? (
                <>
                  <button onClick={() => saveEdit(record._id)}>Save</button>
                  <button onClick={() => setEditingRecord(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => startEdit(record)}>Edit</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}
{tab === "delete" && (
  <div>
    <h2>Delete Weather Records</h2>
    {weatherRecords.length === 0 ? (
      <p>No records found.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Date</th>
            <th>Temperature (°C)</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Action</th> {/* for delete */}
          </tr>
        </thead>
        <tbody>
          {weatherRecords.map((record) => (
            <tr key={record._id}>
              <td>{record.location}</td>
              <td>{record.date}</td>
              <td>{record.temperature}</td>
              <td>{record.coordinates?.lat}</td>
              <td>{record.coordinates?.lon}</td>
              <td>
                <button onClick={() => handleDelete(record._id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}
 {tab === "integrations" && (
    <div>
      {city2.trim() === "" ? (
        <p>Please enter a location in the CREATE tab to view integrations.</p>
      ) : (
        <div>
          <h3>Integrations for {city2}</h3>
          <div className="integration-tabs">
            <button
              onClick={() => setIntegrationTab("maps")}
              className={integrationTab === "maps" ? "active-tab" : ""}
            >
              Location
            </button>
            <button
              onClick={() => {
                setIntegrationTab("youtube");
                fetchYouTubeVideo(`${city2} city tour OR things to do in ${city2} OR travel ${city2}`); // 🔹 dynamic search
              }}
              className={integrationTab === "youtube" ? "active-tab" : ""}
            >
              Related Videos
            </button>
          </div>

          {integrationTab === "maps" && (
            <div>
              <h4>Google Maps:</h4>
              <iframe
                title={`Google Maps for ${city2}`}
                width="300"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  city2
                )}&z=10&output=embed`}
              ></iframe>
            </div>
          )}

          {/* {integrationTab === "youtube" && (
            <div>
              <h4>YouTube:</h4>
              <iframe
                title={`YouTube travel videos for ${city2}`}
                width="560"
                height="315"
                src={`https://www.youtube.com/results?search_query=travel+${encodeURIComponent(city2)}`}
                allowFullScreen
              ></iframe>
            </div>
          )} */}
          {integrationTab === "youtube" && (
            <div style={{ marginTop: "1rem" }}>
              <h4>YouTube:</h4>
              {videoId ? (
                <iframe
                  title={`YouTube travel videos for ${city2}`}
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <p>No video found for {city2}.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )}
  {tab === "export" && <p>Export feature coming soon.</p>}


</section>

<footer className="footer">
        <p>
          Developed by <strong>Divija Morishetty</strong> · PM Accelerator
        </p>
        <button onClick={() => setShowInfo(true)}>ℹ️ Info</button>
      </footer>

      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h2>About PM Accelerator</h2>
            <p>
              PM Accelerator helps professionals gain real-world
              product-management experience through mentorship and hands-on
              projects.
            </p>
            <a
              href="https://www.linkedin.com/company/product-manager-accelerator/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit LinkedIn ↗
            </a>
            <button onClick={() => setShowInfo(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
