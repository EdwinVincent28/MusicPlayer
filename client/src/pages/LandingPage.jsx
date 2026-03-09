import Sidebar from "@/components/Sidebar.jsx";
import PlaylistCard from "@/components/PlaylistCard.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import {
	Play,
	Pause,
	TrendingUp,
	Clock,
	Search,
	Disc3,
	ListMusic,
	Music2,
	ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import { jwtDecode } from "jwt-decode";

// ── Constants ─────────────────────────────────────────────────────────────────
const PROXY = "https://corsproxy.io/?";
const DEEZER = "https://api.deezer.com";

// ── Original static playlists (kept exactly as-is) ───────────────────────────
const playlists = [
	{ title: "Chill Vibes", image: "https://via.placeholder.com/150" },
	{ title: "Top Hits", image: "https://via.placeholder.com/150" },
	{ title: "Workout", image: "https://via.placeholder.com/150" },
	{ title: "Focus", image: "https://via.placeholder.com/150" },
	{ title: "Indie", image: "https://via.placeholder.com/150" },
	{ title: "Jazz", image: "https://via.placeholder.com/150" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(secs) {
	if (!secs) return "--:--";
	return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function CardSkeleton() {
	return (
		<div className="rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden animate-pulse shrink-0 w-44">
			<div className="aspect-square bg-zinc-800" />
			<div className="p-3 space-y-2">
				<div className="h-3 bg-zinc-800 rounded w-3/4" />
				<div className="h-2 bg-zinc-800 rounded w-1/2" />
			</div>
		</div>
	);
}

function TrackSkeleton() {
	return (
		<div className="grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-5 py-3 animate-pulse">
			<div className="w-5 h-5 bg-zinc-800 rounded self-center" />
			<div className="flex items-center gap-3">
				<div className="w-9 h-9 bg-zinc-800 rounded-lg shrink-0" />
				<div className="space-y-1.5 flex-1">
					<div className="h-3 bg-zinc-800 rounded w-2/3" />
					<div className="h-2 bg-zinc-800 rounded w-1/3" />
				</div>
			</div>
			<div className="h-3 bg-zinc-800 rounded w-20 self-center" />
			<div className="h-3 bg-zinc-800 rounded w-10 self-center ml-auto" />
		</div>
	);
}

// ── Track card (horizontal scroll) ───────────────────────────────────────────
function TrackCard({ track, index, onPlay, isActive, isPlaying }) {
	return (
		<div
			onClick={onPlay}
			className={`group relative shrink-0 w-44 rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/20
				${isActive ? "border-violet-500/40 bg-violet-600/10" : "border-white/5 bg-zinc-900 hover:border-violet-500/20"}`}
		>
			<div className="relative aspect-square overflow-hidden">
				<img
					src={track.album?.cover_medium || track.album?.cover}
					alt={track.title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					onError={(e) => {
						e.target.src = `https://picsum.photos/seed/${track.id}/200/200`;
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
				<div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
					<span className="text-white text-[10px] font-black">{index + 1}</span>
				</div>
				<button className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:bg-violet-500 hover:scale-110">
					{isPlaying ? (
						<Pause size={14} fill="white" className="text-white" />
					) : (
						<Play size={14} fill="white" className="text-white ml-0.5" />
					)}
				</button>
			</div>
			<div className="p-3">
				<p
					className={`text-sm font-semibold truncate transition-colors ${isActive ? "text-violet-300" : "text-white"}`}
				>
					{track.title}
				</p>
				<p className="text-zinc-500 text-xs mt-0.5 truncate">
					{track.artist?.name}
				</p>
			</div>
		</div>
	);
}

// ── Media card — albums & playlists (horizontal scroll) ───────────────────────
function MediaCard({ item, type }) {
	const image =
		item.picture_medium || item.picture || item.cover_medium || item.cover;
	const title = item.title || item.name;
	const sub =
		type === "album"
			? item.artist?.name
			: type === "playlist"
				? `${item.nb_tracks ?? "?"} tracks`
				: "";

	return (
		<div className="group shrink-0 w-44 rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-zinc-900 hover:border-violet-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/20">
			<div className="relative aspect-square overflow-hidden">
				<img
					src={image}
					alt={title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					onError={(e) => {
						e.target.src = `https://picsum.photos/seed/${item.id}/200/200`;
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
				<button className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:bg-violet-500">
					<Play size={14} fill="white" className="text-white ml-0.5" />
				</button>
			</div>
			<div className="p-3">
				<p className="text-sm font-semibold text-white truncate">{title}</p>
				{sub && <p className="text-zinc-500 text-xs mt-0.5 truncate">{sub}</p>}
			</div>
		</div>
	);
}

// ── Horizontal scroll section wrapper ────────────────────────────────────────
function ScrollSection({
	title,
	icon: Icon,
	loading,
	skeletonCount = 6,
	children,
}) {
	const scrollRef = useRef(null);
	return (
		<section>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					{Icon && <Icon size={18} className="text-violet-400" />}
					<h2 className="text-lg font-bold text-white">{title}</h2>
				</div>
				<button className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
					See all <ChevronRight size={14} />
				</button>
			</div>
			<div
				ref={scrollRef}
				className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden scroll-smooth"
			>
				{loading
					? Array.from({ length: skeletonCount }).map((_, i) => (
							<CardSkeleton key={i} />
						))
					: children}
			</div>
		</section>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
	// ── Search state (original functionality, kept as-is) ────────────────────
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const controllerRef = useRef(null);
	const dropdownRef = useRef(null);

	// ── User state (original functionality, kept as-is) ──────────────────────
	const [user, setUser] = useState(null);
	const [profileImage, setProfileImage] = useState("");

	// ── Chart state (new) ────────────────────────────────────────────────────
	const [trendingTracks, setTrendingTracks] = useState([]);
	const [trendingPlaylists, setTrendingPlaylists] = useState([]);
	const [trendingAlbums, setTrendingAlbums] = useState([]);
	const [tracksLoading, setTracksLoading] = useState(true);
	const [playlistsLoading, setPlaylistsLoading] = useState(true);
	const [albumsLoading, setAlbumsLoading] = useState(true);
	const [featured, setFeatured] = useState(null);

	const { playTrack, playQueue, currentTrack, playing, togglePlay } =
		usePlayer();

	// ── Close dropdown on outside click ──────────────────────────────────────
	useEffect(() => {
		const handler = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target))
				setShowDropdown(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// ── Fetch user (original logic, kept as-is) ───────────────────────────────
	useEffect(() => {
		const fetchUserDetails = async () => {
			const token = localStorage.getItem("token");
			if (!token) return;
			try {
				const decodedToken = jwtDecode(token);
				const extractedId = decodedToken._id;
				const response = await axios.get(`/api/user/${extractedId}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setUser(response.data);
				if (response.data.profileImage)
					setProfileImage(`http://localhost:4000${response.data.profileImage}`);
			} catch (err) {
				console.error("Failed to load profile:", err);
			}
		};
		fetchUserDetails();
	}, []);

	// ── Fetch Deezer chart data ───────────────────────────────────────────────
	useEffect(() => {
		const fetchCharts = async () => {
			const [tracksRes, playlistsRes, albumsRes] = await Promise.allSettled([
				axios.get(`${PROXY}${DEEZER}/chart/0/tracks?limit=20`),
				axios.get(`${PROXY}${DEEZER}/chart/0/playlists?limit=12`),
				axios.get(`${PROXY}${DEEZER}/chart/0/albums?limit=12`),
			]);

			if (tracksRes.status === "fulfilled") {
				const tracks = tracksRes.value.data?.data || [];
				setTrendingTracks(tracks);
				if (tracks[0]) setFeatured(tracks[0]);
			}
			setTracksLoading(false);

			if (playlistsRes.status === "fulfilled")
				setTrendingPlaylists(playlistsRes.value.data?.data || []);
			setPlaylistsLoading(false);

			if (albumsRes.status === "fulfilled")
				setTrendingAlbums(albumsRes.value.data?.data || []);
			setAlbumsLoading(false);
		};
		fetchCharts();
	}, []);

	// ── Debounced search (original logic, kept as-is) ────────────────────────
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (query.trim()) searchTracks(query);
			else setResults([]);
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [query]);

	const searchTracks = async (searchTerm) => {
		if (controllerRef.current) controllerRef.current.abort();
		controllerRef.current = new AbortController();

		const token = localStorage.getItem("token");
		setSearchLoading(true);
		setShowDropdown(true);
		try {
			const response = await axios.get(
				`/api/deezer/search?q=${encodeURIComponent(searchTerm)}`,
				{
					headers: { Authorization: `Bearer ${token}` },
					signal: controllerRef.current.signal,
				},
			);
			setResults(response.data.results);
		} catch (error) {
			if (axios.isCancel(error)) {
				console.log("Request canceled successfully");
			} else {
				console.error("Actual search error:", error);
			}
		} finally {
			setSearchLoading(false);
		}
	};

	// ── Helpers ───────────────────────────────────────────────────────────────
	const handlePlayTrack = (track) => {
		playTrack({
			id: track.id,
			title: track.title,
			artist: track.artist?.name || track.artist,
			cover: track.album?.cover_medium || track.album?.cover,
			duration: track.duration,
			preview: track.preview,
		});
	};

	const handlePlayAll = () => {
		if (!trendingTracks.length) return;
		if (currentTrack && playing) {
			togglePlay();
			return;
		}
		const queue = trendingTracks.map((t) => ({
			id: t.id,
			title: t.title,
			artist: t.artist?.name,
			cover: t.album?.cover_medium,
			duration: t.duration,
			preview: t.preview,
		}));
		playQueue(queue, 0);
	};

	const isFeaturedPlaying = currentTrack?.id === featured?.id && playing;

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div className="flex bg-zinc-950 min-h-screen text-white">
			<Sidebar />

			<div className="flex-1 overflow-y-auto pb-28">
				{/* ── Top bar (search + user) ── */}
				<div className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl px-8 py-4 flex items-center justify-between border-b border-white/5 gap-6">
					<div className="relative w-full max-w-md" ref={dropdownRef}>
						<Search
							size={16}
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
						/>
						<input
							type="text"
							placeholder="Search songs, artists..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={() => query.trim() && setShowDropdown(true)}
							className="w-full bg-zinc-800/70 text-white placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
						/>
						{showDropdown && query.trim() && (
							<div className="absolute top-12 w-full bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 max-h-80 overflow-y-auto z-50 [&::-webkit-scrollbar]:hidden">
								{searchLoading && (
									<div className="flex items-center gap-3 p-4">
										<div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
										<p className="text-sm text-zinc-400">Searching...</p>
									</div>
								)}
								{!searchLoading && results.length === 0 && (
									<p className="p-4 text-sm text-zinc-400">
										No results for "{query}"
									</p>
								)}
								{!searchLoading &&
									results.slice(0, 8).map((track) => (
										<div
											key={track.id}
											onClick={() => {
												playTrack(track);
												setQuery("");
												setResults([]);
												setShowDropdown(false);
											}}
											className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group border-b border-white/[0.04] last:border-0"
										>
											<img
												src={track.album?.cover || track.album?.cover_small}
												alt={track.title}
												className="w-10 h-10 rounded-lg object-cover shrink-0"
											/>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-white font-medium truncate group-hover:text-violet-300 transition-colors">
													{track.title}
												</p>
												<p className="text-xs text-zinc-500 truncate">
													{track.artist?.name}
												</p>
											</div>
											<span className="text-xs text-zinc-600 shrink-0">
												{formatDuration(track.duration)}
											</span>
										</div>
									))}
							</div>
						)}
					</div>

					<div className="flex items-center gap-3 shrink-0">
						{profileImage ? (
							<img
								src={profileImage}
								alt="Profile"
								className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30"
							/>
						) : (
							<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 ring-2 ring-violet-500/30" />
						)}
						<span className="text-sm font-medium text-zinc-400">
							{user?.username}
						</span>
					</div>
				</div>

				<div className="px-8 py-8 space-y-12">
					{/* ── NEW: Hero banner — #1 trending track ── */}
					<section
						className="relative rounded-3xl overflow-hidden h-72 group cursor-pointer"
						onClick={handlePlayAll}
					>
						{featured ? (
							<>
								<img
									src={
										featured.album?.cover_xl ||
										featured.album?.cover_big ||
										featured.album?.cover_medium
									}
									alt={featured.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
									onError={(e) => {
										e.target.src = "https://picsum.photos/seed/hero/1200/400";
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
								<div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
								<div className="absolute inset-0 flex flex-col justify-center px-10 gap-3">
									<Badge className="w-fit bg-violet-600/80 backdrop-blur text-white border-violet-500/30 text-xs">
										🔥 #1 Trending
									</Badge>
									<h1 className="text-4xl font-black tracking-tight text-white drop-shadow-xl line-clamp-1">
										{featured.title}
									</h1>
									<p className="text-zinc-400 text-sm">
										{featured.artist?.name}
									</p>
									<div className="flex items-center gap-3 mt-1">
										<Button
											onClick={(e) => {
												e.stopPropagation();
												handlePlayAll();
											}}
											className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-6 shadow-lg shadow-violet-900/50 gap-2 transition-all duration-200 hover:scale-105"
										>
											{isFeaturedPlaying ? (
												<>
													<Pause size={14} fill="white" /> Pause
												</>
											) : (
												<>
													<Play size={14} fill="white" /> Play All
												</>
											)}
										</Button>
										<Button
											variant="outline"
											className="rounded-full border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur"
										>
											View Chart
										</Button>
									</div>
								</div>
							</>
						) : (
							<div className="w-full h-full bg-zinc-900 animate-pulse rounded-3xl" />
						)}
					</section>

					{/* ── NEW: Top Trending Tracks — horizontal scroll cards ── */}
					<ScrollSection
						title="Top Trending Tracks"
						icon={TrendingUp}
						loading={tracksLoading}
					>
						{trendingTracks.map((track, i) => (
							<TrackCard
								key={track.id}
								track={track}
								index={i}
								isActive={currentTrack?.id === track.id}
								isPlaying={currentTrack?.id === track.id && playing}
								onPlay={() => {
									if (currentTrack?.id === track.id) {
										togglePlay();
										return;
									}
									const queue = trendingTracks.map((t) => ({
										id: t.id,
										title: t.title,
										artist: t.artist?.name,
										cover: t.album?.cover_medium,
										duration: t.duration,
										preview: t.preview,
									}));
									playQueue(queue, i);
								}}
							/>
						))}
					</ScrollSection>

					{/* ── NEW: Charts full list — table ── */}
					<section>
						<div className="flex items-center gap-2 mb-4">
							<Music2 size={18} className="text-violet-400" />
							<h2 className="text-lg font-bold text-white">
								Charts — Full List
							</h2>
						</div>
						<div className="bg-zinc-900/60 rounded-2xl border border-white/5 overflow-hidden">
							<div className="grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-white/5 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
								<span>#</span>
								<span>Title</span>
								<span>Album</span>
								<span className="flex items-center gap-1 justify-end">
									<Clock size={12} /> Time
								</span>
							</div>
							{tracksLoading
								? Array.from({ length: 5 }).map((_, i) => (
										<TrackSkeleton key={i} />
									))
								: trendingTracks.slice(0, 10).map((track, i) => {
										const isActive = currentTrack?.id === track.id;
										const isPlaying = isActive && playing;
										return (
											<div
												key={track.id}
												onClick={() => {
													if (isActive) {
														togglePlay();
														return;
													}
													const queue = trendingTracks.map((t) => ({
														id: t.id,
														title: t.title,
														artist: t.artist?.name,
														cover: t.album?.cover_medium,
														duration: t.duration,
														preview: t.preview,
													}));
													playQueue(queue, i);
												}}
												className={`grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-5 py-3 items-center cursor-pointer transition-colors group border-b border-white/[0.03] last:border-0
												${isActive ? "bg-violet-600/10" : "hover:bg-white/5"}`}
											>
												<div className="flex items-center justify-center">
													<span
														className={`text-sm font-medium group-hover:hidden ${isActive ? "text-violet-400" : "text-zinc-600"}`}
													>
														{i + 1}
													</span>
													{isPlaying ? (
														<Pause
															size={14}
															className="text-violet-400 hidden group-hover:block"
															fill="currentColor"
														/>
													) : (
														<Play
															size={14}
															className="text-violet-400 hidden group-hover:block"
															fill="currentColor"
														/>
													)}
												</div>
												<div className="flex items-center gap-3 min-w-0">
													<img
														src={track.album?.cover_small}
														alt={track.title}
														className="w-9 h-9 rounded-lg object-cover shrink-0"
													/>
													<div className="min-w-0">
														<p
															className={`text-sm font-medium truncate transition-colors ${isActive ? "text-violet-300" : "text-white group-hover:text-violet-300"}`}
														>
															{track.title}
														</p>
														<p className="text-zinc-500 text-xs truncate">
															{track.artist?.name}
														</p>
													</div>
													{isPlaying && (
														<span className="shrink-0 flex gap-0.5 items-end h-3 ml-1">
															{[1, 2, 3].map((b) => (
																<span
																	key={b}
																	className="w-0.5 bg-violet-500 rounded-full animate-pulse"
																	style={{
																		height: `${8 + b * 3}px`,
																		animationDelay: `${b * 0.15}s`,
																	}}
																/>
															))}
														</span>
													)}
												</div>
												<span className="text-zinc-500 text-sm truncate">
													{track.album?.title}
												</span>
												<span className="text-zinc-500 text-sm text-right">
													{formatDuration(track.duration)}
												</span>
											</div>
										);
									})}
						</div>
					</section>

					{/* ── NEW: Trending Playlists — horizontal scroll ── */}
					<ScrollSection
						title="Trending Playlists"
						icon={ListMusic}
						loading={playlistsLoading}
					>
						{trendingPlaylists.map((pl) => (
							<MediaCard key={pl.id} item={pl} type="playlist" />
						))}
					</ScrollSection>

					{/* ── NEW: Trending Albums — horizontal scroll ── */}
					<ScrollSection
						title="Trending Albums"
						icon={Disc3}
						loading={albumsLoading}
					>
						{trendingAlbums.map((album) => (
							<MediaCard key={album.id} item={album} type="album" />
						))}
					</ScrollSection>
				</div>
			</div>

			<MusicPlayer />
		</div>
	);
}
