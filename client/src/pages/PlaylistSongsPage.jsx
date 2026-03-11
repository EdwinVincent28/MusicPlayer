import Sidebar from "@/components/Sidebar.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import { Play, Shuffle, Clock, Pause, Music2, Trash2, CheckCircle, AlertCircle  } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import { useParams, useNavigate } from "react-router-dom";

function formatDuration(seconds) {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlaylistSongsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, currentTrack, playing, playQueue } = usePlayer();

    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get(`/api/playlist/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlaylist(data);

                // Convert Map from backend to array
                const songsArray = data.playlistSongs
                    ? Object.entries(data.playlistSongs).map(([trackId, song]) => ({
                          id: trackId,
                          ...song,
                      }))
                    : [];
                setSongs(songsArray);
                console.log("playlist data:", data);
console.log("image path:", data.playlistImage);
            } catch (err) {
                console.error("Failed to fetch playlist", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [id]);

    const handleRemove = async (trackId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/playlist/${id}/tracks`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { trackId },
            });
            setSongs((prev) => prev.filter((s) => s.id !== trackId));
            showToast("Song removed from playlist");
        } catch (err) {
            console.error("Failed to remove song", err);
            showToast("Failed to remove song", "error");
        }
    };

    const handlePlay = (song) => {
        playTrack({
            id: song.id,
            title: song.title,
            preview: song.preview,
            duration: song.duration,
            artist: { name: song.artist },
            album: { cover: song.cover },
        });
    };

    const gradients = [
        "from-violet-600 to-fuchsia-700",
        "from-blue-600 to-cyan-500",
        "from-rose-500 to-orange-500",
        "from-emerald-500 to-teal-600",
    ];

    const fallbackGradient = gradients[0];

    return (
        <div className="flex bg-zinc-950 min-h-screen text-white">
            {toast && (  
                <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border backdrop-blur-sm
                    ${toast.type === "error"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}
                >
                    {toast.type === "error"
                        ? <AlertCircle size={15} className="shrink-0" />
                        : <CheckCircle size={15} className="shrink-0" />
                    }
                    {toast.message}
                </div>
            )}

            <Sidebar />

            <div className="flex-1 overflow-y-auto pb-28">
                {/* Header */}
                <div className="relative h-80 overflow-hidden">
                    {/* Blurred mosaic background from song covers */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 opacity-40 blur-sm scale-110">
                        {songs.slice(0, 8).map((song, i) => (
                            <img
                                key={i}
                                src={song.cover}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
                        ))}
                        {Array.from({ length: Math.max(0, 8 - songs.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-violet-950" />
                        ))}
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-950/60 via-zinc-950/70 to-zinc-950" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 px-8 pb-6 flex items-end gap-6">
                        {/* Playlist cover */}
                        <div className={`w-44 h-44 rounded-2xl bg-gradient-to-br ${fallbackGradient} flex items-center justify-center shadow-2xl shadow-violet-900/60 shrink-0 overflow-hidden`}>
                            {playlist?.playlistImage ? (
                                <img
                                    src={playlist.playlistImage}
                                    alt={playlist?.name}
                                    className="w-full h-full object-cover"
                                        onError={(e) => console.log("IMAGE FAILED TO LOAD:", e.target.src)}
                                />
                            ) : (
                                <Music2 size={64} className="text-white/50" />
                            )}
                        </div>

                        <div className="pb-2">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Playlist</p>
                            <h1 className="text-5xl font-black tracking-tight text-white mb-3">
                                {loading ? "Loading..." : playlist?.name}
                            </h1>
                            {playlist?.description && (
                                <p className="text-zinc-400 text-sm mb-1">{playlist.description}</p>
                            )}
                            <p className="text-zinc-400 text-sm">
                                <span className="text-white font-medium">You</span> • {songs.length} songs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="px-8 py-6 flex items-center gap-5 border-b border-white/5">
                    <button
                        data-testid="play-all-btn"
                        onClick={() => playQueue(songs.map((song) => ({
                            id: song.id,
                            title: song.title,
                            preview: song.preview,
                            duration: song.duration,
                            artist: { name: song.artist },
                            album: { cover: song.cover },
                        })), 0)}
                        disabled={songs.length === 0}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/60 hover:scale-105 active:scale-95 transition-transform duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Play size={22} fill="white" className="text-white ml-1" />
                    </button>
                    <button
                        onClick={() => {
                            const shuffled = [...songs].sort(() => Math.random() - 0.5);
                            playQueue(shuffled.map((song) => ({
                                id: song.id,
                                title: song.title,
                                preview: song.preview,
                                duration: song.duration,
                                artist: { name: song.artist },
                                album: { cover: song.cover },
                            })), 0);
                        }}
                        disabled={songs.length === 0}
                        className="text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

                    {!loading && songs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
                                <Music2 size={36} className="text-zinc-700" />
                            </div>
                            <p className="text-white font-semibold text-lg">No songs yet</p>
                            <p className="text-zinc-500 text-sm">Add songs to this playlist from the search bar</p>
                        </div>
                    )}

                    {!loading && songs.map((song, index) => {
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
                                        onError={(e) => { e.target.src = "https://picsum.photos/seed/default/40/40"; }}
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

                                {/* Remove button */}
                                <button
                                    data-testid={`remove-song-btn-${song.id}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(song.id);
                                    }}
                                    className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove from playlist"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <MusicPlayer />
        </div>
    );
}