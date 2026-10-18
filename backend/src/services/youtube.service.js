const axios = require("axios");

exports.fetchSongsByMoodFromYouTube = async (mood) => {
  // Only 3 target moods handling
  const moodQueryMap = {
    happy: "happy upbeat Hindi Bollywood songs playlist",
    sad: "sad Hindi lofi acoustic songs playlist",
    surprised: "trending viral hit songs hindi"
  };

  const normalizedMood = mood.toLowerCase().trim();
  // Agar in 3 ke alawa koi query aaye toh fallback search keyword
  const searchQuery = moodQueryMap[normalizedMood] || `${normalizedMood} mood songs Hindi`;
  const apiKey = process.env.YOUTUBE_API_KEY;

  const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      part: "snippet",
      maxResults: 10, // Sidebar me top 10 songs dikhane ke liye
      q: searchQuery,
      type: "video",
      videoCategoryId: "10", // 10 = Music Category
      key: apiKey,
    },
  });

  return response.data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
  }));
};

exports.searchSongsOnYouTube = async (query) => {
  const apiKey = process.env.YOUTUBE_API_KEY;

  const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      part: "snippet",
      maxResults: 10,
      q: query,
      type: "video",
      videoCategoryId: "10",
      key: apiKey,
    },
  });

  return response.data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
  }));
};