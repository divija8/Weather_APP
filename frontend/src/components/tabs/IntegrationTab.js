// IntegrationTab.js
import React, { useEffect, useState } from "react";
import { getYouTubeVideoId } from "../../services/youtubeAPI";

const IntegrationTab = ({ city2 }) => {
  const [videoId, setVideoId] = useState(null);
  const [mapURL, setMapURL] = useState("");

  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!city2 || city2.trim() === "") return;

      // Fetch YouTube video
      const id = await getYouTubeVideoId(city2);
      setVideoId(id);

      // Generate Google Map URL
      const encodedCity = encodeURIComponent(city2);
      setMapURL(`https://www.google.com/maps?q=${encodedCity}&output=embed`);
    };

    fetchIntegrations();
  }, [city2]); // Re-run when city2 changes

  return (
    <div className="integration-content" style={{ textAlign: "center", marginTop: "20px" }}>
      {city2.trim() === "" ? (
        <p>Please enter a value in the Create tab to view integrations.</p>
      ) : (
        <>
          {videoId ? (
            <iframe
              title={`YouTube video for ${city2}`}
              width="400"
              height="240"
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: "8px", marginBottom: "15px" }}
            />
          ) : (
            <p>No video found for {city2}</p>
          )}

          {mapURL && (
            <iframe
              title={`Google Map of ${city2}`}
              src={mapURL}
              width="400"
              height="240"
              style={{
                marginTop: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
              loading="lazy"
            />
          )}
        </>
      )}
    </div>
  );
};

export default IntegrationTab;
