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

const getChartTracks = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
 
  try {
    const response = await axios.get(
      `${DEEZER_BASE_URL}/chart/0/tracks?limit=${limit}`
    );
 
    const tracks = response.data?.data || [];
 
    return res.status(200).json({
      success: true,
      data: tracks.map((track) => ({
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
          cover: track.album.cover,
          cover_small: track.album.cover_small,
          cover_medium: track.album.cover_medium,
          cover_big: track.album.cover_big,
          cover_xl: track.album.cover_xl,
        },
      })),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      "Failed to fetch chart tracks from Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};
 
const getChartPlaylists = async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
 
  try {
    const response = await axios.get(
      `${DEEZER_BASE_URL}/chart/0/playlists?limit=${limit}`
    );
 
    const playlists = response.data?.data || [];
 
    return res.status(200).json({
      success: true,
      data: playlists.map((pl) => ({
        id: pl.id,
        title: pl.title,
        nb_tracks: pl.nb_tracks,
        picture: pl.picture,
        picture_medium: pl.picture_medium,
      })),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      "Failed to fetch chart playlists from Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};
 
const getChartAlbums = async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
 
  try {
    const response = await axios.get(
      `${DEEZER_BASE_URL}/chart/0/albums?limit=${limit}`
    );
 
    const albums = response.data?.data || [];
 
    return res.status(200).json({
      success: true,
      data: albums.map((album) => ({
        id: album.id,
        title: album.title,
        cover: album.cover,
        cover_medium: album.cover_medium,
        artist: {
          id: album.artist.id,
          name: album.artist.name,
        },
      })),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      "Failed to fetch chart albums from Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};

const formatArtist = (artist) => ({
  id: artist.id,
  name: artist.name,
  nb_fan: artist.nb_fan,
  picture: artist.picture,
  picture_medium: artist.picture_medium,
  picture_big: artist.picture_big,
  picture_xl: artist.picture_xl,
});
 
const getArtistById = async (req, res) => {
  const { id } = req.params;
 
  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/artist/${id}`);
    const artist = response.data;
 
    if (!artist || !artist.id) {
      return res.status(404).json({ success: false, message: "Artist not found." });
    }
 
    return res.status(200).json({ success: true, data: formatArtist(artist) });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message || "Failed to fetch artist from Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};
 
const searchArtists = async (req, res) => {
  const { q, limit = 20 } = req.query;
 
  if (!q || !q.trim()) {
    return res.status(400).json({
      success: false,
      message: "Query parameter 'q' is required.",
    });
  }
 
  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/search/artist`, {
      params: { q, limit },
    });
 
    const artists = response.data?.data || [];
 
    return res.status(200).json({
      success: true,
      data: artists.map(formatArtist),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message || "Failed to search artists on Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};

const getArtistTopTracks = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 10;
 
  try {
    const response = await axios.get(
      `${DEEZER_BASE_URL}/artist/${id}/top?limit=${limit}`
    );
 
    const tracks = response.data?.data || [];
 
    return res.status(200).json({
      success: true,
      data: tracks.map((track) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        preview: track.preview,
        rank: track.rank,
        album: {
          id: track.album.id,
          title: track.album.title,
          cover: track.album.cover,
          cover_small: track.album.cover_small,
          cover_medium: track.album.cover_medium,
        },
      })),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      "Failed to fetch top tracks from Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};
 
const getArtistAlbums = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 20;
 
  try {
    const response = await axios.get(
      `${DEEZER_BASE_URL}/artist/${id}/albums?limit=${limit}`
    );
 
    const albums = response.data?.data || [];
 
    return res.status(200).json({
      success: true,
      data: albums.map((album) => ({
        id: album.id,
        title: album.title,
        release_date: album.release_date,
        record_type: album.record_type,
        cover: album.cover,
        cover_small: album.cover_small,
        cover_medium: album.cover_medium,
        cover_big: album.cover_big,
      })),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      "Failed to fetch artist albums from Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};
 
const getAlbumTracks = async (req, res) => {
  const { id } = req.params;
 
  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/album/${id}/tracks`);
 
    const tracks = response.data?.data || [];
 
    return res.status(200).json({
      success: true,
      data: tracks.map((track) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        preview: track.preview,
        rank: track.rank,
      })),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      "Failed to fetch album tracks from Deezer.";
 
    return res.status(status).json({ success: false, message });
  }
};

module.exports = { searchTracks, getChartTracks, getChartPlaylists, getChartAlbums, 
getArtistById, searchArtists, getArtistTopTracks, getArtistAlbums, getAlbumTracks };