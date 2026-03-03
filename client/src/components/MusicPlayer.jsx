import { useState, useEffect } from "react";
import axios from "axios";
import {
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Shuffle,
	Repeat,
	Volume2,
	Heart,
	Maximize2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "../context/PlayerContext";

export default function MusicPlayer() {
    const { currentTrack, playing, progress, duration, volume, togglePlay, seek, setVolume, formatTime } = usePlayer();
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        if (!currentTrack) return;

        const fetchLikeStatus = async () => {
            try {
                const { data } = await axios.get(`/api/user/like/${currentTrack.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setLiked(data.isLiked);
            } catch (err) {
                console.error("Failed to fetch like status", err);
            }
        };

        fetchLikeStatus();
    }, [currentTrack]);

    const handleLikeToggle = async () => {
        try {
            await axios.put("/api/user/like",
                { trackId: currentTrack.id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setLiked((prev) => !prev);
        } catch (err) {
            console.error("Failed to toggle like", err);
        }
    };

    if (!currentTrack) return null; 

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-4 w-64 shrink-0">
                <div className="relative shrink-0">
                    <img
                        src={currentTrack.album.cover} 
                        alt="Now Playing"
                        style={playing ? { animation: "spin 8s linear infinite" } : {}}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-violet-500/30 transition-all duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-violet-500 border-2 border-zinc-900" />
                </div>
                <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                        {currentTrack.title}  
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5 truncate">
                        {currentTrack.artist.name} 
                    </p>
                </div>
                <button
                    onClick={handleLikeToggle}
                    className={`ml-auto shrink-0 transition-colors duration-200 ${liked ? "text-violet-400" : "text-zinc-600 hover:text-zinc-300"}`}
                >
                    <Heart size={18} fill={liked ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
                <div className="flex items-center gap-5">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                        <Shuffle size={18} />
                    </button>
                    <button className="text-zinc-400 hover:text-white transition-colors">
                        <SkipBack size={22} fill="currentColor" />
                    </button>
                    <button
                        onClick={togglePlay}  
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/60 hover:scale-105 active:scale-95 transition-transform duration-150"
                    >
                        {playing ? (
                            <Pause size={18} fill="white" className="text-white" />
                        ) : (
                            <Play size={18} fill="white" className="text-white ml-0.5" />
                        )}
                    </button>
                    <button className="text-zinc-400 hover:text-white transition-colors">
                        <SkipForward size={22} fill="currentColor" />
                    </button>
                    <button className="text-zinc-500 hover:text-white transition-colors">
                        <Repeat size={18} />
                    </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 w-full">
                    <span className="text-zinc-600 text-xs w-8 text-right shrink-0">
                        {formatTime(progress)} 
                    </span>
                    <Slider
                        value={[progress]}
                        onValueChange={([val]) => seek(val)} 
                        max={duration || 100}
                        step={0.1}
                        className="flex-1 [&_[role=slider]]:bg-violet-400 [&_[role=slider]]:border-0 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-violet-500 [&_.bg-primary]:to-fuchsia-500"
                    />
                    <span className="text-zinc-600 text-xs w-8 shrink-0">
                        {formatTime(duration)}  
                    </span>
                </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-4 w-64 justify-end shrink-0">
                <Volume2 size={18} className="text-zinc-500" />
                <Slider
                    value={[volume]}
                    onValueChange={([val]) => setVolume(val)}  
                    max={100}
                    step={1}
                    className="w-24 [&_[role=slider]]:bg-zinc-300 [&_[role=slider]]:border-0"
                />
                <button className="text-zinc-600 hover:text-zinc-300 transition-colors ml-2">
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>
    );
}