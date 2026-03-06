import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/Sidebar.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import {
	Play,
	Pause,
	Shuffle,
	Clock,
	Heart,
	MoreHorizontal,
	CheckCircle2,
	Users,
	Music2,
	Disc3,
	UserPlus,
	UserCheck,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayer } from "../context/PlayerContext.jsx";

const PROXY = "https://corsproxy.io/?";
const DEEZER = "https://api.deezer.com";

function formatFans(n) {
	if (!n) return "—";
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toString();
}

function formatDuration(secs) {
	if (!secs) return "--:--";
	return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

// ─── Skeleton loaders ────────────────────────────────────────────────────────
function HeroSkeleton() {
	return (
		<div className="relative h-80 bg-zinc-900 animate-pulse">
			<div className="absolute bottom-0 left-0 px-8 pb-6 flex items-end gap-6">
				<div className="w-24 h-24 rounded-2xl bg-zinc-800" />
				<div className="space-y-3 pb-1">
					<div className="h-3 w-24 bg-zinc-800 rounded" />
					<div className="h-10 w-64 bg-zinc-800 rounded" />
					<div className="h-3 w-48 bg-zinc-800 rounded" />
				</div>
			</div>
		</div>
	);
}

function TrackSkeleton() {
	return (
		<div className="grid grid-cols-[40px_1fr_120px_80px_40px] gap-4 px-4 py-3 animate-pulse">
			<div className="w-5 h-5 bg-zinc-800 rounded self-center" />
			<div className="flex items-center gap-3">
				<div className="w-9 h-9 bg-zinc-800 rounded-lg shrink-0" />
				<div className="h-3 bg-zinc-800 rounded w-2/3" />
			</div>
			<div className="h-3 bg-zinc-800 rounded w-12 self-center ml-auto" />
			<div className="h-3 bg-zinc-800 rounded w-10 self-center ml-auto" />
			<div />
		</div>
	);
}

// ─── Track row ───────────────────────────────────────────────────────────────
function TrackRow({ track, albumCover, artistName, index }) {
	const { currentTrack, playing, playTrack, playQueue, togglePlay } =
		usePlayer();
	const [liked, setLiked] = useState(false);
	const [hovered, setHovered] = useState(false);
	const isActive = currentTrack?.id === track.id;
	const isPlaying = isActive && playing;

	const handleClick = () => {
		if (isActive) {
			togglePlay();
		} else {
			playTrack({
				id: track.id,
				title: track.title,
				artist: artistName,
				cover: albumCover || track.album?.cover_medium,
				duration: track.duration,
				preview: track.preview,
			});
		}
	};

	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={handleClick}
			className={`grid grid-cols-[40px_1fr_120px_80px_40px] gap-4 px-4 py-2.5 rounded-xl items-center cursor-pointer transition-all duration-150 group
				${isActive ? "bg-violet-600/10 border border-violet-500/20" : "hover:bg-white/5"}`}
		>
			<div className="flex items-center justify-center w-6">
				{hovered || isActive ? (
					<span className="text-white">
						{isPlaying ? (
							<Pause size={15} fill="currentColor" />
						) : (
							<Play size={15} fill="currentColor" className="ml-0.5" />
						)}
					</span>
				) : (
					<span
						className={`text-sm font-medium ${isActive ? "text-violet-400" : "text-zinc-600"}`}
					>
						{index + 1}
					</span>
				)}
			</div>

			<div className="flex items-center gap-3 min-w-0">
				<img
					src={albumCover || track.album?.cover_small}
					alt=""
					className="w-9 h-9 rounded-lg object-cover shrink-0 opacity-80"
					onError={(e) => {
						e.target.src = `https://picsum.photos/seed/${track.id}/40/40`;
					}}
				/>
				<span
					className={`text-sm font-medium truncate transition-colors ${isActive ? "text-violet-300" : "text-zinc-200"}`}
				>
					{track.title}
				</span>
				{isPlaying && (
					<span className="shrink-0 flex gap-0.5 items-end h-3">
						{[1, 2, 3].map((b) => (
							<span
								key={b}
								className="w-0.5 bg-violet-400 rounded-full animate-pulse"
								style={{
									height: `${8 + b * 3}px`,
									animationDelay: `${b * 0.15}s`,
								}}
							/>
						))}
					</span>
				)}
			</div>

			<span className="text-zinc-600 text-xs text-right">
				{track.rank ? `${Math.round(track.rank / 1_000_000)}M` : "—"}
			</span>
			<span className="text-zinc-500 text-sm text-right">
				{formatDuration(track.duration)}
			</span>

			<button
				onClick={(e) => {
					e.stopPropagation();
					setLiked(!liked);
				}}
				className={`transition-colors duration-200 opacity-0 group-hover:opacity-100 ${liked ? "text-violet-400 !opacity-100" : "text-zinc-600 hover:text-zinc-300"}`}
			>
				<Heart size={15} fill={liked ? "currentColor" : "none"} />
			</button>
		</div>
	);
}

// ─── Album section ────────────────────────────────────────────────────────────
function AlbumSection({ album, artistName }) {
	const { playTrack, playQueue } = usePlayer();
	const [expanded, setExpanded] = useState(true);
	const [tracks, setTracks] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!expanded || tracks.length > 0) return;
		const fetch = async () => {
			setLoading(true);
			try {
				const res = await axios.get(
					`${PROXY}${DEEZER}/album/${album.id}/tracks`,
				);
				setTracks(res.data?.data || []);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, [expanded, album.id]);

	return (
		<div className="mb-10">
			<div
				className="flex items-center gap-4 mb-4 cursor-pointer group"
				onClick={() => setExpanded(!expanded)}
			>
				<img
					src={album.cover_medium || album.cover_small}
					alt={album.title}
					className="w-14 h-14 rounded-xl object-cover shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-200"
				/>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="text-white font-bold text-lg truncate">
							{album.title}
						</h3>
						<Badge
							variant="outline"
							className="text-zinc-500 border-zinc-700 text-xs shrink-0"
						>
							{album.release_date?.slice(0, 4)}
						</Badge>
					</div>
					<p className="text-zinc-500 text-sm capitalize">
						{album.record_type || "album"}
					</p>
				</div>
				{tracks[0] && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							const queueTracks = tracks.map((t) => ({
								id: t.id,
								title: t.title,
								artist: artistName,
								cover: album.cover_medium,
								duration: t.duration,
								preview: t.preview,
							}));
							playQueue(queueTracks, 0);
						}}
						className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500 hover:scale-110 shadow-lg shadow-violet-900/50"
					>
						<Play size={14} fill="white" className="text-white ml-0.5" />
					</button>
				)}
				<span className="text-zinc-700 text-xs ml-2">
					{expanded ? "▲" : "▼"}
				</span>
			</div>

			{expanded && (
				<>
					<div className="grid grid-cols-[40px_1fr_120px_80px_40px] gap-4 px-4 py-2 mb-1 text-xs font-semibold text-zinc-700 uppercase tracking-wider border-b border-white/5">
						<span>#</span>
						<span>Title</span>
						<span className="text-right">Rank</span>
						<span className="flex items-center gap-1 justify-end">
							<Clock size={11} /> Time
						</span>
						<span />
					</div>
					{loading
						? Array.from({ length: 4 }).map((_, i) => <TrackSkeleton key={i} />)
						: tracks.map((track, i) => (
								<TrackRow
									key={track.id}
									track={track}
									albumCover={album.cover_medium}
									artistName={artistName}
									index={i}
								/>
							))}
				</>
			)}
		</div>
	);
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ArtistPage() {
	const { id } = useParams();
	const { state } = useLocation();
	const { currentTrack, playing, playTrack, playQueue, togglePlay } =
		usePlayer();

	const [artist, setArtist] = useState(state?.artist || null);
	const [topTracks, setTopTracks] = useState([]);
	const [albums, setAlbums] = useState([]);
	const [loading, setLoading] = useState(!state?.artist);
	const [tracksLoading, setTracksLoading] = useState(true);
	const [albumsLoading, setAlbumsLoading] = useState(true);
	const [followed, setFollowed] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	const [followHovered, setFollowHovered] = useState(false);
	const [activeTab, setActiveTab] = useState("discography");

	// Fetch artist info if not passed via router state
	useEffect(() => {
		if (artist) return;
		const fetch = async () => {
			setLoading(true);
			try {
				const res = await axios.get(`${PROXY}${DEEZER}/artist/${id}`);
				setArtist(res.data);
			} catch (e) {
				console.error("Failed to fetch artist", e);
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, [id]);

	// Fetch top tracks
	useEffect(() => {
		if (!id) return;
		const fetch = async () => {
			setTracksLoading(true);
			try {
				const res = await axios.get(
					`${PROXY}${DEEZER}/artist/${id}/top?limit=10`,
				);
				setTopTracks(res.data?.data || []);
			} catch (e) {
				console.error("Failed to fetch top tracks", e);
			} finally {
				setTracksLoading(false);
			}
		};
		fetch();
	}, [id]);

	// Fetch albums
	useEffect(() => {
		if (!id) return;
		const fetch = async () => {
			setAlbumsLoading(true);
			try {
				const res = await axios.get(
					`${PROXY}${DEEZER}/artist/${id}/albums?limit=20`,
				);
				setAlbums(res.data?.data || []);
			} catch (e) {
				console.error("Failed to fetch albums", e);
			} finally {
				setAlbumsLoading(false);
			}
		};
		fetch();
	}, [id]);

	// Check follow state from backend
	useEffect(() => {
		const checkFollow = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token || !id) return;
				const { data } = await axios.get(`/api/user/following/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setFollowed(data.following);
			} catch (e) {
				// silently fail — follow state just defaults to false
			}
		};
		checkFollow();
	}, [id]);

	const handleFollow = async () => {
		// Optimistic update — flip immediately so button feels instant
		const wasFollowed = followed;
		setFollowed(!wasFollowed);
		setFollowLoading(true);

		try {
			const token = localStorage.getItem("token");
			await axios.put(
				"/api/user/follow",
				{
					artistId: Number(id),
					artistName: artist?.name,
					artistPicture: artist?.picture_medium,
					action: wasFollowed ? "unfollow" : "follow",
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
		} catch (e) {
			// Revert on failure
			console.error("Follow failed", e);
			setFollowed(wasFollowed);
		} finally {
			setFollowLoading(false);
		}
	};

	const handlePlayAll = () => {
		if (!topTracks.length) return;

		// If already playing this artist's queue, just toggle pause/play
		if (currentTrack?.artistId === Number(id) && playing) {
			togglePlay();
			return;
		}

		// Build queue from all top tracks and start from the first
		const queueTracks = topTracks.map((t) => ({
			id: t.id,
			title: t.title,
			artist: artist?.name,
			artistId: Number(id),
			cover: t.album?.cover_medium,
			duration: t.duration,
			preview: t.preview,
		}));

		playQueue(queueTracks, 0);
	};

	return (
		<div className="flex bg-zinc-950 min-h-screen text-white">
			<Sidebar />

			<div className="flex-1 overflow-y-auto pb-28">
				{/* Hero */}
				{loading ? (
					<HeroSkeleton />
				) : (
					<div className="relative h-80 overflow-hidden">
						<img
							src={artist?.picture_xl || artist?.picture_big}
							alt={artist?.name}
							className="w-full h-full object-cover object-top"
							onError={(e) => {
								e.target.src = `https://picsum.photos/seed/${id}/1400/500`;
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
						<div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 to-transparent" />

						<div className="absolute bottom-0 left-0 px-8 pb-6 flex items-end gap-6">
							<img
								src={artist?.picture_big || artist?.picture_medium}
								alt={artist?.name}
								className="w-24 h-24 rounded-2xl object-cover ring-4 ring-zinc-950 shadow-2xl"
								onError={(e) => {
									e.target.src = `https://picsum.photos/seed/${id}/200/200`;
								}}
							/>
							<div className="flex flex-col gap-1 pb-1">
								<div className="flex items-center gap-2">
									<CheckCircle2
										size={16}
										className="text-violet-400"
										fill="currentColor"
									/>
									<span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
										Verified Artist
									</span>
								</div>
								<h1 className="text-5xl font-black tracking-tight text-white drop-shadow-2xl">
									{artist?.name}
								</h1>
								<div className="flex items-center gap-4 mt-1">
									<span className="text-zinc-400 text-sm flex items-center gap-1.5">
										<Users size={13} /> {formatFans(artist?.nb_fan)} fans
									</span>
									{artist?.nb_album && (
										<>
											<span className="text-zinc-600">•</span>
											<span className="text-zinc-400 text-sm">
												{artist.nb_album} albums
											</span>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Action bar */}
				<div className="px-8 py-5 flex items-center gap-4 border-b border-white/5">
					<Button
						onClick={handlePlayAll}
						disabled={topTracks.length === 0}
						className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-7 gap-2 shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-40"
					>
						{playing && currentTrack?.artist === artist?.name ? (
							<>
								<Pause size={15} fill="white" /> Pause
							</>
						) : (
							<>
								<Play size={15} fill="white" className="ml-0.5" /> Play All
							</>
						)}
					</Button>

					{/* Follow button */}
					<Button
						onClick={handleFollow}
						disabled={followLoading}
						variant="outline"
						onMouseEnter={() => setFollowHovered(true)}
						onMouseLeave={() => setFollowHovered(false)}
						className={`rounded-full px-6 gap-2 transition-all duration-200 border min-w-[120px] justify-center
							${
								followed
									? followHovered
										? "border-red-500/50 text-red-400 bg-red-600/10"
										: "border-violet-500/50 text-violet-300 bg-violet-600/10"
									: "border-white/20 text-white bg-transparent hover:bg-white/10"
							}`}
					>
						{followLoading ? (
							<Loader2 size={15} className="animate-spin" />
						) : followed ? (
							followHovered ? (
								<>
									<UserPlus size={15} /> Unfollow
								</>
							) : (
								<>
									<UserCheck size={15} /> Following
								</>
							)
						) : (
							<>
								<UserPlus size={15} /> Follow
							</>
						)}
					</Button>

					<Button
						variant="ghost"
						className="rounded-full text-zinc-400 hover:text-white gap-2 ml-auto"
					>
						<MoreHorizontal size={18} />
					</Button>
				</div>

				{/* Tabs */}
				<div className="px-8 pt-6">
					<div className="flex gap-1 mb-8 border-b border-white/5">
						{[
							{ key: "discography", label: "Discography", icon: Disc3 },
							{ key: "popular", label: "Popular Tracks", icon: Music2 },
							{ key: "about", label: "About", icon: Users },
						].map(({ key, label, icon: Icon }) => (
							<button
								key={key}
								onClick={() => setActiveTab(key)}
								className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px
									${activeTab === key ? "border-violet-500 text-violet-300" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
							>
								<Icon size={15} />
								{label}
							</button>
						))}
					</div>

					{/* Discography */}
					{activeTab === "discography" && (
						<div>
							<p className="text-zinc-600 text-sm mb-6">
								{albums.length} releases
							</p>
							{albumsLoading
								? Array.from({ length: 3 }).map((_, i) => (
										<div key={i} className="mb-10 animate-pulse">
											<div className="flex items-center gap-4 mb-4">
												<div className="w-14 h-14 bg-zinc-800 rounded-xl" />
												<div className="space-y-2">
													<div className="h-4 w-40 bg-zinc-800 rounded" />
													<div className="h-3 w-20 bg-zinc-800 rounded" />
												</div>
											</div>
										</div>
									))
								: albums.map((album) => (
										<AlbumSection
											key={album.id}
											album={album}
											artistName={artist?.name}
										/>
									))}
						</div>
					)}

					{/* Popular Tracks */}
					{activeTab === "popular" && (
						<div>
							<p className="text-zinc-600 text-sm mb-6">Top tracks by plays</p>
							<div className="grid grid-cols-[40px_1fr_120px_80px_40px] gap-4 px-4 py-2 mb-1 text-xs font-semibold text-zinc-700 uppercase tracking-wider border-b border-white/5">
								<span>#</span>
								<span>Title</span>
								<span className="text-right">Rank</span>
								<span className="flex items-center gap-1 justify-end">
									<Clock size={11} /> Time
								</span>
								<span />
							</div>
							{tracksLoading
								? Array.from({ length: 5 }).map((_, i) => (
										<TrackSkeleton key={i} />
									))
								: topTracks.map((track, i) => (
										<TrackRow
											key={track.id}
											track={track}
											albumCover={track.album?.cover_medium}
											artistName={artist?.name}
											index={i}
										/>
									))}
						</div>
					)}

					{/* About */}
					{activeTab === "about" && (
						<div className="max-w-2xl space-y-6">
							{artist?.picture_xl && (
								<div className="rounded-2xl overflow-hidden h-64">
									<img
										src={artist.picture_xl}
										alt={artist.name}
										className="w-full h-full object-cover object-top"
									/>
								</div>
							)}
							<div className="grid grid-cols-3 gap-4">
								{[
									{
										label: "Fans",
										value: formatFans(artist?.nb_fan),
										icon: Users,
									},
									{
										label: "Albums",
										value: artist?.nb_album ?? albums.length,
										icon: Disc3,
									},
									{
										label: "Top Tracks",
										value: topTracks.length,
										icon: Music2,
									},
								].map(({ label, value, icon: Icon }) => (
									<div
										key={label}
										className="bg-zinc-900/60 rounded-2xl border border-white/5 p-5 flex flex-col gap-2"
									>
										<Icon size={18} className="text-violet-400" />
										<p className="text-2xl font-black text-white">{value}</p>
										<p className="text-zinc-500 text-xs">{label}</p>
									</div>
								))}
							</div>
							<div className="bg-zinc-900/60 rounded-2xl border border-white/5 p-6">
								<h3 className="text-white font-semibold mb-2">
									Artist on Deezer
								</h3>
								<a
									href={artist?.link}
									target="_blank"
									rel="noreferrer"
									className="text-violet-400 hover:text-violet-300 text-sm underline underline-offset-2 transition-colors"
								>
									View on Deezer →
								</a>
							</div>
						</div>
					)}
				</div>
			</div>

			<MusicPlayer />
		</div>
	);
}
