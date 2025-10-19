import React from "react";

const DeleteTab = ({ weatherRecords, fetchWeatherRecords }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await fetch(`/api/weather/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete record");
      }

      fetchWeatherRecords(); // Refresh list after deletion
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting the record.");
    }
  };

  return (
    <div className="crud-delete">
      <h2>Delete Weather Records</h2>
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
    </div>
  );
};

export default DeleteTab;