import { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import { createPortal } from "react-dom";
import { Plus, ListMusic, X, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { resolveImageUrl } from "../api/axiosInstance";

export default function TrackMenu({ trackData, onClose }) {
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [creating, setCreating] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const fileInputRef = useRef(null);
    const menuRef = useRef(null);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

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
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    // After playlists load, check if dropdown overflows viewport
    // Music player takes ~100px at the bottom so we account for that
    useEffect(() => {
        if (!loading && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 100) {
                setOpenUpward(true);
            }
        }
    }, [loading]);

    useEffect(() => {
        const handler = (e) => {
            if (!showModal && menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose, showModal]);

    useEffect(() => {
        return () => clearTimeout(toastTimer.current);
    }, []);

    const showToast = (message, type = "error") => {
        setToast({ message, type });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    };

    const addToPlaylist = async (playlistId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `/api/playlist/${playlistId}/tracks`,
                {
                    trackId: trackData.id,
                    title: trackData.title,
                    artist: trackData.artist,
                    cover: trackData.cover,
                    preview: trackData.preview,
                    duration: trackData.duration,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast("Song added to playlist", "success");
            setTimeout(() => onClose(), 1500); 
            // onClose();
        }catch (err) {
            const message = err.response?.data?.error;
            if (message === "Track already in playlist") {
                showToast("This song is already in the playlist");
            } else {
                showToast("Failed to add to playlist");
            }
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
            handleModalClose();
            showToast("New playlist created and song added!", "success");
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            showToast("Playlist could not be created");
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            {/* Dropdown — opens upward or downward based on available space */}
            <div
                ref={menuRef}
                className={`absolute right-0 z-50 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden
                    ${openUpward ? "bottom-8" : "top-8"}`}
            >

            {toast && (
                <div className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b
                    ${toast.type === "error"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}
                >
                    {toast.type === "error"
                        ? <AlertCircle size={13} className="shrink-0" />
                        : <CheckCircle size={13} className="shrink-0" />
                    }
                    <span>{toast.message}</span>
                </div>
            )}

                <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Add to Playlist</p>
                </div>
                <div className="max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {loading && <p className="text-zinc-500 text-xs px-3 py-3">Loading playlists...</p>}
                    {!loading && userPlaylists.length === 0 && (
                        <p className="text-zinc-500 text-xs px-3 py-3">No playlists yet</p>
                    )}
                    {!loading && userPlaylists.map((pl) => (
                        <button
                            key={pl._id}
                            data-testid={`add-to-playlist-${pl._id}`}
                            onClick={() => addToPlaylist(pl._id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                        >
                            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                {pl.playlistImage
                                    ? <img src={resolveImageUrl(pl.playlistImage)} alt="" className="w-full h-full object-cover" />
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

            {/* Create Playlist Modal */}
            {showModal && createPortal(
                <div
                    className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center"
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
                                    onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
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
                                onClick={createAndAdd}
                                disabled={!newName.trim() || creating}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/40 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                            >
                                {creating ? "Creating..." : "Create & Add"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}