import {
	createContext,
	useContext,
	useState,
	useRef,
	useEffect,
	useCallback,
} from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
	const [currentTrack, setCurrentTrack] = useState(null);
	const [queue, setQueue] = useState([]); // full list of tracks
	const [queueIndex, setQueueIndex] = useState(0); // which track is active
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0); // 0–100
	const [volume, setVolume] = useState(0.75);
	const audioRef = useRef(new Audio());

	// ── Helpers ────────────────────────────────────────────────────────────────
	const loadAndPlay = useCallback((track) => {
		const audio = audioRef.current;
		audio.pause();
		audio.src = track.preview || "";
		audio.currentTime = 0;
		setCurrentTrack(track);
		setProgress(0);

		if (track.preview) {
			audio
				.play()
				.then(() => setPlaying(true))
				.catch((err) => {
					console.error("Playback failed:", err);
					setPlaying(false);
				});
		} else {
			setPlaying(false);
			console.warn("No preview URL for:", track.title);
		}
	}, []);

	// ── Volume sync ────────────────────────────────────────────────────────────
	useEffect(() => {
		audioRef.current.volume = volume;
	}, [volume]);

	// ── Audio event listeners ──────────────────────────────────────────────────
	useEffect(() => {
		const audio = audioRef.current;

		const onTimeUpdate = () => {
			if (!audio.duration) return;
			setProgress((audio.currentTime / audio.duration) * 100);
		};

		// Auto-advance to next track in queue when current one ends
		const onEnded = () => {
			setQueueIndex((prev) => {
				const next = prev + 1;
				setQueue((q) => {
					if (next < q.length) {
						loadAndPlay(q[next]);
						return q;
					}
					// End of queue
					setPlaying(false);
					setProgress(0);
					return q;
				});
				return next < queue.length ? next : prev;
			});
		};

		audio.addEventListener("timeupdate", onTimeUpdate);
		audio.addEventListener("ended", onEnded);
		return () => {
			audio.removeEventListener("timeupdate", onTimeUpdate);
			audio.removeEventListener("ended", onEnded);
		};
	}, [loadAndPlay, queue.length]);

	// ── Public API ─────────────────────────────────────────────────────────────

	// Play a single track (clears queue)
	const playTrack = useCallback(
		(track) => {
			if (currentTrack?.id === track.id) {
				audioRef.current
					.play()
					.then(() => setPlaying(true))
					.catch(() => {});
				return;
			}
			setQueue([track]);
			setQueueIndex(0);
			loadAndPlay(track);
		},
		[currentTrack?.id, loadAndPlay],
	);

	// Play an ordered list starting at a given index
	const playQueue = useCallback(
		(tracks, startIndex = 0) => {
			if (!tracks?.length) return;
			setQueue(tracks);
			setQueueIndex(startIndex);
			loadAndPlay(tracks[startIndex]);
		},
		[loadAndPlay],
	);

	const skipNext = useCallback(() => {
		setQueue((q) => {
			const next = queueIndex + 1;
			if (next < q.length) {
				setQueueIndex(next);
				loadAndPlay(q[next]);
			}
			return q;
		});
	}, [queueIndex, loadAndPlay]);

	const skipPrev = useCallback(() => {
		const audio = audioRef.current;
		// If more than 3s in, restart current track instead of going back
		if (audio.currentTime > 3) {
			audio.currentTime = 0;
			setProgress(0);
			return;
		}
		setQueue((q) => {
			const prev = queueIndex - 1;
			if (prev >= 0) {
				setQueueIndex(prev);
				loadAndPlay(q[prev]);
			}
			return q;
		});
	}, [queueIndex, loadAndPlay]);

	const togglePlay = useCallback(() => {
		const audio = audioRef.current;
		if (playing) {
			audio.pause();
			setPlaying(false);
		} else if (audio.src) {
			audio
				.play()
				.then(() => setPlaying(true))
				.catch((err) => console.error("Resume failed:", err));
		}
	}, [playing]);

	const seekTo = useCallback((pct) => {
		const audio = audioRef.current;
		if (!audio.duration) return;
		audio.currentTime = (pct / 100) * audio.duration;
		setProgress(pct);
	}, []);

	const hasPrev = queueIndex > 0;
	const hasNext = queueIndex < queue.length - 1;

	return (
		<PlayerContext.Provider
			value={{
				currentTrack,
				playing,
				queue,
				queueIndex,
				hasPrev,
				hasNext,
				progress,
				seekTo,
				volume,
				setVolume,
				playTrack,
				playQueue,
				togglePlay,
				skipNext,
				skipPrev,
			}}
		>
			{children}
		</PlayerContext.Provider>
	);
}

export function usePlayer() {
	const ctx = useContext(PlayerContext);
	if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
	return ctx;
}
