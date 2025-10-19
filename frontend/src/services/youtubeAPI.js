export const getYouTubeVideoId = async (cityName) => {
  if (!cityName || cityName.trim() === "") return null;

  try {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || "YOUR_API_KEY";

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        cityName
      )} travel&key=${API_KEY}&type=video&maxResults=1`
    );

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    } else {
      console.warn(`No YouTube videos found for ${cityName}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to fetch YouTube video:", error);
    return null;
  }
};