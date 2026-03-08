import Sidebar from "@/components/Sidebar.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import { Play, Shuffle, Clock, Heart, MoreHorizontal, Pause, Plus, ListMusic, X, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import { createPortal } from "react-dom";

function formatDuration(seconds) {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

const TrackMenu = ({ track, onClose }) => {
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [creating, setCreating] = useState(false);
    const fileInputRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get("/api/playlist", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserPlaylists(data);
            } catch (err) {
                console.error("Failed to fetch playlists", err);
            } finally {
                setLoadingPlaylists(false);
            }
        };
        fetchPlaylists();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (!showModal && menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose, showModal]);

    const addToPlaylist = async (playlistId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `/api/playlist/${playlistId}/tracks`,
                {
                    trackId: track.id,
                    title: track.title,
                    artist: track.artist,
                    cover: track.cover,
                    preview: track.preview,
                    duration: track.duration,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onClose();
        } catch (err) {
            console.error("Failed to add to playlist", err);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleModalClose = () => {
        setShowModal(false);
        setNewName("");
        setNewDesc("");
        setImageFile(null);
        setImagePreview(null);
    };

    const createAndAdd = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("name", newName.trim());
            formData.append("description", newDesc.trim());
            if (imageFile) formData.append("playlistImage", imageFile);
            const { data: newPlaylist } = await axios.post("/api/playlist", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            await addToPlaylist(newPlaylist._id);
        } catch (err) {
            console.error("Failed to create playlist", err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <div ref={menuRef} className="absolute right-0 top-8 z-50 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Add to Playlist</p>
                </div>
                <div className="max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {loadingPlaylists && <p className="text-zinc-500 text-xs px-3 py-3">Loading playlists...</p>}
                    {!loadingPlaylists && userPlaylists.length === 0 && (
                        <p className="text-zinc-500 text-xs px-3 py-3">No playlists yet</p>
                    )}
                    {!loadingPlaylists && userPlaylists.map((pl) => (
                        <button
                            key={pl._id}
                            onClick={() => addToPlaylist(pl._id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                        >
                            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                {pl.playlistImage
                                    ? <img src={`http://localhost:4000${pl.playlistImage}`} alt="" className="w-full h-full object-cover" />
                                    : <ListMusic size={12} className="text-zinc-500" />
                                }
                            </div>
                            <span className="truncate flex-1">{pl.name}</span>
                        </button>
                    ))}
                </div>
                <div className="border-t border-white/5">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-violet-400 hover:bg-white/5 transition-colors"
                    >
                        <Plus size={14} />
                        New Playlist
                    </button>
                </div>
            </div>

            {showModal && createPortal(
                <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center" onClick={handleModalClose}>
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white text-xl font-bold">Create Playlist</h2>
                            <button onClick={handleModalClose} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Cover Image</label>
                                <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-36 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-800">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-white text-xs font-semibold">Change Image</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-600">
                                            <Upload size={24} />
                                            <p className="text-xs">Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Name <span className="text-violet-400">*</span></label>
                                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createAndAdd()} placeholder="My Playlist" className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
                                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleModalClose} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-semibold hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={createAndAdd} disabled={!newName.trim() || creating} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/40 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                                {creating ? "Creating..." : "Create & Add"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};


export default function LikedSongs() {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, currentTrack, playing, playQueue } = usePlayer();
    const [openMenuTrackId, setOpenMenuTrackId] = useState(null);

    useEffect(() => {
        const fetchLikedSongs = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get("/api/user/liked-songs", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLikedSongs(data.likedSongs);
            } catch (err) {
                console.error("Failed to fetch liked songs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedSongs();
    }, []);

    const handleUnlike = async (trackId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                "/api/user/like",
                { trackId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLikedSongs((prev) => prev.filter((s) => s.id !== trackId));
        } catch (err) {
            console.error("Failed to unlike song", err);
        }
    };

    const handlePlay = (song) => {
        console.log("Preview URL:", song.preview);
        playTrack({
            id: song.id,
            title: song.title,
            preview: song.preview,
            duration: song.duration,
            artist: { name: song.artist },
            cover: song.cover,
            album: { cover_medium: song.cover },
        });
    };

    return (
        <div className="flex bg-zinc-950 min-h-screen text-white">
            <Sidebar />

            <div className="flex-1 overflow-y-auto pb-28">
                <div className="relative h-72 overflow-hidden">
                    {/* Blurred mosaic background from song covers */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 opacity-40 blur-sm scale-110">
                        {likedSongs.slice(0, 8).map((song, i) => (
                            <img
                                key={i}
                                src={song.cover}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ))}
                        {/* fill empty slots */}
                        {Array.from({ length: Math.max(0, 8 - likedSongs.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-violet-950" />
                        ))}
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-950/60 via-zinc-950/70 to-zinc-950" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 px-8 pb-6 flex items-end gap-6">
                        {/* Liked Songs cover art */}
                        <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-700 flex items-center justify-center shadow-2xl shadow-violet-900/60 shrink-0">
                            <Heart size={64} fill="white" className="text-white" />
                        </div>

                        <div className="pb-2">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Playlist</p>
                            <h1 className="text-5xl font-black tracking-tight text-white mb-3">
                                Liked Songs
                            </h1>
                            <p className="text-zinc-400 text-sm">
                                <span className="text-white font-medium">You</span> • {likedSongs.length} songs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="px-8 py-6 flex items-center gap-5 border-b border-white/5">
                    <button
                        onClick={() => playQueue(likedSongs.map((song) => ({
                            id: song.id,
                            title: song.title,
                            preview: song.preview,
                            duration: song.duration,
                            artist: { name: song.artist },
                            album: { cover: song.cover },
                        })), 0)}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/60 hover:scale-105 active:scale-95 transition-transform duration-150"
                    >
                        <Play size={22} fill="white" className="text-white ml-1" />
                    </button>
                    <button
                        onClick={() => {
                            const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
                            playQueue(shuffled.map((song) => ({
                                id: song.id,
                                title: song.title,
                                preview: song.preview,
                                duration: song.duration,
                                artist: { name: song.artist },
                                album: { cover: song.cover },
                            })), 0);
                            // console.log(playQueue);
                        }}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <Shuffle size={22} />
                    </button>
                </div>

                {/* Track List */}
                <div className="px-8 py-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-[40px_1fr_200px_80px_40px] gap-4 px-4 py-2 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-white/5">
                        <span>#</span>
                        <span>Title</span>
                        <span>Artist</span>
                        <span className="flex items-center gap-1 justify-end">
                            <Clock size={12} /> Duration
                        </span>
                        <span />
                    </div>

                    {loading && (
                        <div className="flex flex-col gap-3 mt-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-[40px_1fr_200px_80px_40px] gap-4 px-4 py-3 animate-pulse">
                                    <div className="w-5 h-5 bg-zinc-800 rounded" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-3 bg-zinc-800 rounded w-3/4" />
                                            <div className="h-2 bg-zinc-800 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-3 bg-zinc-800 rounded w-24 self-center" />
                                    <div className="h-3 bg-zinc-800 rounded w-10 self-center ml-auto" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && likedSongs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
                                <Heart size={36} className="text-zinc-700" />
                            </div>
                            <p className="text-white font-semibold text-lg">No liked songs yet</p>
                            <p className="text-zinc-500 text-sm">Songs you like will appear here</p>
                        </div>
                    )}

                    {!loading &&
                        likedSongs.map((song, index) => {
                            const isPlaying = currentTrack?.id === song.id && playing;
                            return (
                                <div
                                    key={song.id}
                                    onDoubleClick={() => handlePlay(song)}
                                    className={`grid grid-cols-[40px_1fr_200px_80px_40px] gap-4 px-4 py-3 rounded-lg items-center hover:bg-white/5 transition-colors group cursor-pointer border-b border-white/[0.03] last:border-0 ${
                                        currentTrack?.id === song.id ? "bg-violet-500/10" : ""
                                    }`}
                                >
                                    {/* Index / Play indicator */}
                                    <div className="flex items-center justify-center">
                                        <span className={`text-sm font-medium group-hover:hidden ${currentTrack?.id === song.id ? "text-violet-400" : "text-zinc-600"}`}>
                                            {isPlaying ? (
                                                <span className="flex gap-[2px] items-end h-4">
                                                    <span className="w-[3px] bg-violet-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: "60%" }} />
                                                    <span className="w-[3px] bg-violet-400 rounded-full animate-[bounce_0.8s_ease-in-out_0.2s_infinite]" style={{ height: "100%" }} />
                                                    <span className="w-[3px] bg-violet-400 rounded-full animate-[bounce_0.8s_ease-in-out_0.4s_infinite]" style={{ height: "40%" }} />
                                                </span>
                                            ) : (
                                                index + 1
                                            )}
                                        </span>
                                        <button
                                            onClick={() => handlePlay(song)}
                                            className="hidden group-hover:flex items-center justify-center"
                                        >
                                            {isPlaying
                                                ? <Pause size={14} fill="currentColor" className="text-violet-400" />
                                                : <Play size={14} fill="currentColor" className="text-white" />
                                            }
                                        </button>
                                    </div>

                                    {/* Title + cover */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={song.cover}
                                            alt={song.title}
                                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium truncate transition-colors ${currentTrack?.id === song.id ? "text-violet-400" : "text-white group-hover:text-violet-300"}`}>
                                                {song.title}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Artist */}
                                    <span className="text-zinc-500 text-sm truncate">{song.artist}</span>

                                    {/* Duration */}
                                    <span className="text-zinc-500 text-sm text-right">
                                        {formatDuration(song.duration)}
                                    </span>

                                    <div className="relative flex items-center gap-2">
                                        {/* Heart — unlike */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnlike(song.id);
                                            }}
                                            className="text-violet-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove from liked songs"
                                        >
                                            <Heart size={16} fill="currentColor" />
                                        </button>

                                        {/* 3 dots — add to playlist */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuTrackId(openMenuTrackId === song.id ? null : song.id);
                                            }}
                                            className="text-zinc-600 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>

                                        {openMenuTrackId === song.id && (
                                            <TrackMenu
                                                track={song}
                                                onClose={() => setOpenMenuTrackId(null)}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            <MusicPlayer />
        </div>
    );
}