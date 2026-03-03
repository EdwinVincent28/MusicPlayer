const axios = require("axios");

const DEEZER_BASE_URL = "https://api.deezer.com";

const searchTracks = async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({
      success: false,
      message: "Query parameter 'q' is required.",
    });
  }

  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/search`, {
      params: { q },
    });

    const { data, total, next, prev } = response.data;

    return res.status(200).json({
      success: true,
      total,
      next: next || null,
      prev: prev || null,
      results: data.map((track) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        preview: track.preview,
        artist: {
          id: track.artist.id,
          name: track.artist.name,
          picture: track.artist.picture_medium,
        },
        album: {
          id: track.album.id,
          title: track.album.title,
          cover: track.album.cover_medium,
        },
      })),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || "Failed to fetch data from Deezer.";

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

module.exports = { searchTracks };