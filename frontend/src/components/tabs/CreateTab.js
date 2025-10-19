function CreateTab({ tab, city2, setCity2, startDate, setStartDate, endDate, setEndDate, handleSaveWeather, savedWeather }) {
  /* CREATE tab */
  return (
    <>
      {tab === "create" && (
        <div className="crud-create">
          <h4>Save Query Details To DB</h4>
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
    </>
  );
}

export default CreateTab;