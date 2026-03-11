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
	VolumeX,
	Heart,
	Maximize2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "../context/PlayerContext";

export default function MusicPlayer() {
	const {
		currentTrack,
		playing,
		togglePlay,
		progress,
		seekTo,
		volume,
		setVolume,
		skipNext,
		skipPrev,
		hasPrev,
		hasNext,
	} = usePlayer();
	const [liked, setLiked] = useState(false);

	useEffect(() => {
		if (!currentTrack?.id) return;
		const fetchLikedStatus = async () => {
			try {
				const token = localStorage.getItem("token");
				const { data } = await axios.get(
					`/api/user/like/${currentTrack.id}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setLiked(data.isLiked);
			} catch (err) {
				console.error("Failed to fetch liked status:", err);
				setLiked(false);
			}
		};
		fetchLikedStatus();
	}, [currentTrack?.id]);

	// Hide player when nothing is selected
	if (!currentTrack) return null;

	const durSecs = currentTrack.duration ?? 0;
	// Calculate elapsed from progress %
	const elapsed = Math.floor((progress / 100) * durSecs);
	const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

	const hasPreview = !!currentTrack.preview;

	const handleLike = async () => {
		try {
			const token = localStorage.getItem("token");
			await axios.put(
				"/api/user/like",
				{
					trackId: currentTrack.id,
					title: currentTrack.title,
					artist: currentTrack.artist?.name || currentTrack.artist,
					cover: currentTrack.album?.cover || currentTrack.cover,
					preview: currentTrack.preview,
					duration: currentTrack.duration,
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setLiked((prev) => !prev);
		} catch (err) {
			console.error("Failed to like/unlike track:", err);
		}
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/90 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex items-center justify-between gap-4">
			{/* Track Info */}
			<div className="flex items-center gap-4 w-64 shrink-0">
				<div className="relative shrink-0">
					<img
						src={currentTrack.album?.cover || currentTrack.cover}
						alt="Now Playing"
						style={playing ? { animation: "spin 8s linear infinite" } : {}}
						className="w-14 h-14 rounded-xl object-cover ring-2 ring-violet-500/30 transition-all duration-300"
						onError={(e) => {
							e.target.src = "https://picsum.photos/seed/default/56/56";
						}}
					/>
					<div
						className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${playing ? "bg-violet-500" : "bg-zinc-600"}`}
					/>
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-white font-semibold text-sm truncate">
						{currentTrack.title}
					</p>
					<p className="text-zinc-500 text-xs mt-0.5 truncate">
						{currentTrack.artist?.name || currentTrack.artist}
					</p>
					{!hasPreview && (
						<p className="text-amber-500/70 text-[10px] mt-0.5">
							No preview available
						</p>
					)}
				</div>
				<button
					id="like-button"
					onClick={handleLike}
					className={`ml-auto shrink-0 transition-colors duration-200 ${liked ? "text-violet-400" : "text-zinc-600 hover:text-zinc-300"}`}
				>
					<Heart size={18} fill={liked ? "currentColor" : "none"} />
				</button>
			</div>

			{/* Controls */}
			<div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
				<div className="flex items-center gap-5">
					<button className="text-zinc-500 hover:text-white transition-colors">
						<Shuffle size={18} />
					</button>
					<button
						onClick={skipPrev}
						disabled={!hasPrev}
						className="text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					>
						<SkipBack size={22} fill="currentColor" />
					</button>
					<button
						onClick={togglePlay}
						disabled={!hasPreview}
						className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/60 hover:scale-105 active:scale-95 transition-transform duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{playing ? (
							<Pause size={18} fill="white" className="text-white" />
						) : (
							<Play size={18} fill="white" className="text-white ml-0.5" />
						)}
					</button>
					<button
						onClick={skipNext}
						disabled={!hasNext}
						className="text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					>
						<SkipForward size={22} fill="currentColor" />
					</button>
					<button className="text-zinc-500 hover:text-white transition-colors">
						<Repeat size={18} />
					</button>
				</div>

				{/* Progress bar */}
				<div className="flex items-center gap-3 w-full">
					<span className="text-zinc-600 text-xs w-8 text-right shrink-0">
						{fmt(elapsed)}
					</span>
					<Slider
						value={[progress]}
						onValueChange={([val]) => seekTo(val)}
						max={100}
						step={0.5}
						disabled={!hasPreview}
						className="flex-1 [&_[role=slider]]:bg-violet-400 [&_[role=slider]]:border-0 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-violet-500 [&_.bg-primary]:to-fuchsia-500"
					/>
					<span className="text-zinc-600 text-xs w-8 shrink-0">
						{fmt(durSecs)}
					</span>
				</div>
			</div>

			{/* Volume */}
			<div className="flex items-center gap-3 w-64 justify-end shrink-0">
				<button
					onClick={() => setVolume(volume > 0 ? 0 : 0.75)}
					className="text-zinc-500 hover:text-white transition-colors"
				>
					{volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
				</button>
				<Slider
					value={[volume * 100]}
					onValueChange={([val]) => setVolume(val / 100)}
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
