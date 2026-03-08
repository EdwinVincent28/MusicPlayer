import Sidebar from "@/components/Sidebar.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import { Plus, ListMusic, Trash2, Play, Music2, Upload, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Playlists() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("/api/playlist", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlaylists(data);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("name", newName.trim());
            formData.append("description", newDesc.trim());
            if (imageFile) formData.append("playlistImage", imageFile);

            const { data } = await axios.post("/api/playlist", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setPlaylists((prev) => [...prev, data]);
            setNewName("");
            setNewDesc("");
            setImageFile(null);
            setImagePreview(null);
            setShowModal(false);
        } catch (err) {
            console.error("Failed to create playlist", err);
        } finally {
            setCreating(false);
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

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/playlist/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlaylists((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            console.error("Failed to delete playlist", err);
        }
    };

    const songCount = (playlist) => {
        if (!playlist.playlistSongs) return 0;
        if (playlist.playlistSongs instanceof Map) return playlist.playlistSongs.size;
        return Object.keys(playlist.playlistSongs).length;
    };

    // Gradient palette for playlist cards
    const gradients = [
        "from-violet-600 to-fuchsia-700",
        "from-blue-600 to-cyan-500",
        "from-rose-500 to-orange-500",
        "from-emerald-500 to-teal-600",
        "from-amber-500 to-yellow-400",
        "from-indigo-600 to-purple-700",
        "from-pink-500 to-rose-600",
        "from-sky-500 to-blue-600",
    ];

    return (
        <div className="flex bg-zinc-950 min-h-screen text-white">
            <Sidebar />

            <div className="flex-1 overflow-y-auto pb-28">
                {/* Header */}
                <div className="relative px-8 pt-10 pb-8 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-1">
                                Playlists
                            </h1>
                            <p className="text-zinc-500 text-sm">Your personal collections</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95 transition-transform duration-150"
                        >
                            <Plus size={18} />
                            New Playlist
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-8">
                    {loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="w-full aspect-square rounded-2xl bg-zinc-800 mb-3" />
                                    <div className="h-3 bg-zinc-800 rounded w-3/4 mb-2" />
                                    <div className="h-2 bg-zinc-800 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && playlists.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 gap-5">
                            <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center shadow-inner">
                                <ListMusic size={40} className="text-zinc-700" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold text-lg mb-1">No playlists yet</p>
                                <p className="text-zinc-500 text-sm">Create your first playlist to get started</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95 transition-transform duration-150 mt-2"
                            >
                                <Plus size={18} />
                                Create Playlist
                            </button>
                        </div>
                    )}

                    {!loading && playlists.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {playlists.map((playlist, index) => {
                                const gradient = gradients[index % gradients.length];
                                const count = songCount(playlist);
                                return (
                                    <div
                                        key={playlist._id}
                                        onClick={() => navigate(`/playlists/${playlist._id}`)}
                                        className="group cursor-pointer"
                                    >
                                        {/* Cover */}
                                        <div className={`relative w-full aspect-square rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]`}>
                                            {playlist.playlistImage
                                                ? <img src={`http://localhost:4000${playlist.playlistImage}`} alt={playlist.name} className="w-full h-full object-cover absolute inset-0" />
                                                : <Music2 size={48} className="text-white/30" />
                                            }

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); /* play logic */ }}
                                                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
                                                >
                                                    <Play size={16} fill="white" className="text-white ml-0.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, playlist._id)}
                                                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-red-500/60 transition-colors"
                                                >
                                                    <Trash2 size={15} className="text-white" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <p className="text-white font-semibold text-sm truncate group-hover:text-violet-300 transition-colors">
                                            {playlist.name}
                                        </p>
                                        <p className="text-zinc-500 text-xs mt-0.5">
                                            {count} {count === 1 ? "song" : "songs"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Playlist Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
                    onClick={handleModalClose}
                >
                    <div
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white text-xl font-bold">Create Playlist</h2>
                            <button onClick={handleModalClose} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Image Upload */}
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                                    Cover Image
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-full h-36 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-800"
                                >
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
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                                    Name <span className="text-violet-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                    placeholder="My Playlist"
                                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder="Optional description"
                                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleModalClose}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-semibold hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newName.trim() || creating}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/40 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MusicPlayer />
        </div>
    );
}