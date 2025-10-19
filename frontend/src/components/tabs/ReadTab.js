import React, { useEffect } from "react";

const ReadTab = ({ tab, weatherRecords, fetchWeatherRecords, setTab }) => {
  useEffect(() => {
    if (tab === "read" && fetchWeatherRecords && weatherRecords.length === 0) {
      fetchWeatherRecords();
    }
  }, [tab, fetchWeatherRecords, weatherRecords]);

  return (
    <div className="crud-read">
      <h2>Saved Weather Records</h2>

      {weatherRecords.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
  );
};

export default ReadTab;