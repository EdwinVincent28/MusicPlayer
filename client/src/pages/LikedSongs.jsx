import Sidebar from "@/components/Sidebar.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import { Play, Shuffle, Clock, Heart, MoreHorizontal, Pause, CheckCircle, AlertCircle } from "lucide-react"; 
import { useState, useEffect, useRef } from "react"; 
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import TrackMenu from "@/components/TrackMenu"; 
import { formatDuration, songCount } from "../utils/musicUtils";


// export function formatDuration(seconds) {
//     if (!seconds) return "--:--";
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m}:${s.toString().padStart(2, "0")}`;
// }

export default function LikedSongs() {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, currentTrack, playing, playQueue } = usePlayer();
    const [openMenuTrackId, setOpenMenuTrackId] = useState(null);

    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

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

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    };

    const handleUnlike = async (trackId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                "/api/user/like",
                { trackId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLikedSongs((prev) => prev.filter((s) => s.id !== trackId));
            showToast("Song removed from liked songs");
        } catch (err) {
            console.error("Failed to unlike song", err);
            showToast("Failed to remove song", "error");
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
            {toast && (
    <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border backdrop-blur-sm transition-all
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

                                    {/* ← last cell: heart + 3-dot menu */}
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
                                            data-testid={`liked-menu-btn-${song.id}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuTrackId(openMenuTrackId === song.id ? null : song.id);
                                            }}
                                            className="text-zinc-600 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>

                                        {/* ← now using shared TrackMenu with trackData prop */}
                                        {openMenuTrackId === song.id && (
                                            <TrackMenu
                                                trackData={{
                                                    id: song.id,
                                                    title: song.title,
                                                    artist: song.artist,
                                                    cover: song.cover,
                                                    preview: song.preview,
                                                    duration: song.duration,
                                                }}
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