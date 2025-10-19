import React from "react";
import { exportAsJSON, exportAsCSV } from "../../services/exportUtils";

const ExportTab = ({ weatherRecords }) => {
  const hasRecords = Array.isArray(weatherRecords) && weatherRecords.length > 0;

  const handleJSONClick = () => {
    if (!hasRecords) return;
    exportAsJSON(weatherRecords);
  };

  const handleCSVClick = () => {
    if (!hasRecords) return;
    exportAsCSV(weatherRecords);
  };

  return (
    <div className="export-tab">
      <h3>Export Weather Data</h3>
      <button onClick={handleJSONClick} disabled={!hasRecords}>
        Export as JSON
      </button>
      <button onClick={handleCSVClick} disabled={!hasRecords}>
        Export as CSV
      </button>
      {/* <button onClick={handleExportPDF}>Export as PDF</button> */}
      {/* <button onClick={handleExportMarkdown}>Export as Markdown</button> */}
      {!hasRecords && <p>No saved weather records to export.</p>}
    </div>
  );
};

export default ExportTab;
