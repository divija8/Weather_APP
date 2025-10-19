import React, { useState } from "react";

const UpdateTab = ({ weatherRecords, fetchWeatherRecords }) => {
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});

  const startEdit = (record) => {
    setEditingRecordId(record._id);
    setUpdatedData({
      location: record.location,
      date: record.date,
      temperature: record.temperature,
      coordinates: {
        lat: record.coordinates?.lat || "",
        lon: record.coordinates?.lon || "",
      },
    });
  };

  const cancelEdit = () => {
    setEditingRecordId(null);
    setUpdatedData({});
  };

  const handleChange = (field, value) => {
    if (field === "lat" || field === "lon") {
      setUpdatedData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [field]: value,
        },
      }));
    } else {
      setUpdatedData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const saveUpdate = async (id) => {
    try {
      const response = await fetch(`/api/weather/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update record");
      }

      setEditingRecordId(null);
      setUpdatedData({});
      fetchWeatherRecords(); // Refresh data
    } catch (error) {
      console.error("Update failed:", error);
      alert("Error updating record");
    }
  };

  return (
    <div className="crud-update">
      <h2>Update Weather Records</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Location</th>
            <th>Date</th>
            <th>Temperature (°C)</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {weatherRecords.map((record) => (
            <tr key={record._id}>
              {editingRecordId === record._id ? (
                <>
                  <td>
                    <input
                      value={updatedData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={updatedData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={updatedData.temperature}
                      onChange={(e) => handleChange("temperature", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={updatedData.coordinates.lat}
                      onChange={(e) => handleChange("lat", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={updatedData.coordinates.lon}
                      onChange={(e) => handleChange("lon", e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => saveUpdate(record._id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{record.location}</td>
                  <td>{record.date}</td>
                  <td>{record.temperature}</td>
                  <td>{record.coordinates?.lat}</td>
                  <td>{record.coordinates?.lon}</td>
                  <td>
                    <button onClick={() => startEdit(record)}>Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UpdateTab;