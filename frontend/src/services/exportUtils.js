const isValidRecords = (records) =>
  Array.isArray(records) && records.length > 0;

const downloadBlob = (data, filename, mimeType) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsJSON = (records) => {
  if (!isValidRecords(records)) return;
  const jsonData = JSON.stringify(records, null, 2);
  downloadBlob(jsonData, "weather_export.json", "application/json");
};

export const exportAsCSV = (records) => {
  if (!isValidRecords(records)) return;
  const headers = Object.keys(records[0]);
  const rows = records.map((entry) =>
    headers.map((field) => JSON.stringify(entry[field] ?? "")).join(",")
  );
  const csvContent = [headers.join(","), ...rows].join("\n");
  downloadBlob(csvContent, "weather_export.csv", "text/csv");
};
