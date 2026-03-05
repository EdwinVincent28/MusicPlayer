import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayer } from "@/context/PlayerContext.jsx";

const artist = {
	name: "The Weeknd",
	verified: true,
	genre: "R&B / Pop",
	followers: "85.2M",
	monthlyListeners: "112.4M",
	banner: "https://picsum.photos/seed/weeknd-banner/1400/500",
	avatar: "https://picsum.photos/seed/weeknd-avatar/200/200",
	bio: "Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer, songwriter, and record producer. Known for his sonic versatility and dark, atmospheric soundscapes.",
};

const albums = [
	{
		id: 1,
		title: "After Hours",
		year: "2020",
		cover: "https://picsum.photos/seed/afterhours/80/80",
		tracks: [
			{
				id: 1,
				title: "Alone Again",
				duration: "4:10",
				durationSecs: 250,
				plays: "312M",
			},
			{
				id: 2,
				title: "Too Late",
				duration: "3:59",
				durationSecs: 239,
				plays: "289M",
			},
			{
				id: 3,
				title: "Hardest To Love",
				duration: "3:31",
				durationSecs: 211,
				plays: "267M",
			},
			{
				id: 4,
				title: "Scared To Live",
				duration: "3:12",
				durationSecs: 192,
				plays: "198M",
			},
			{
				id: 5,
				title: "Snowchild",
				duration: "4:07",
				durationSecs: 247,
				plays: "245M",
			},
			{
				id: 6,
				title: "Escape From LA",
				duration: "6:00",
				durationSecs: 360,
				plays: "178M",
			},
			{
				id: 7,
				title: "Heartless",
				duration: "3:18",
				durationSecs: 198,
				plays: "401M",
			},
			{
				id: 8,
				title: "Faith",
				duration: "6:37",
				durationSecs: 397,
				plays: "231M",
			},
			{
				id: 9,
				title: "Blinding Lights",
				duration: "3:20",
				durationSecs: 200,
				plays: "3.2B",
			},
			{
				id: 10,
				title: "In Your Eyes",
				duration: "3:58",
				durationSecs: 238,
				plays: "512M",
			},
			{
				id: 11,
				title: "Save Your Tears",
				duration: "3:35",
				durationSecs: 215,
				plays: "1.1B",
			},
			{
				id: 12,
				title: "Repeat After Me",
				duration: "4:02",
				durationSecs: 242,
				plays: "156M",
			},
			{
				id: 13,
				title: "After Hours",
				duration: "6:01",
				durationSecs: 361,
				plays: "289M",
			},
		],
	},
	{
		id: 2,
		title: "Starboy",
		year: "2016",
		cover: "https://picsum.photos/seed/starboy/80/80",
		tracks: [
			{
				id: 1,
				title: "Starboy",
				duration: "3:50",
				durationSecs: 230,
				plays: "2.1B",
			},
			{
				id: 2,
				title: "Party Monster",
				duration: "4:09",
				durationSecs: 249,
				plays: "412M",
			},
			{
				id: 3,
				title: "False Alarm",
				duration: "3:40",
				durationSecs: 220,
				plays: "389M",
			},
			{
				id: 4,
				title: "Reminder",
				duration: "3:38",
				durationSecs: 218,
				plays: "356M",
			},
			{
				id: 5,
				title: "Rockin'",
				duration: "3:52",
				durationSecs: 232,
				plays: "278M",
			},
			{
				id: 6,
				title: "Secrets",
				duration: "4:25",
				durationSecs: 265,
				plays: "312M",
			},
			{
				id: 7,
				title: "True Colors",
				duration: "4:10",
				durationSecs: 250,
				plays: "267M",
			},
			{
				id: 8,
				title: "Sidewalks",
				duration: "3:48",
				durationSecs: 228,
				plays: "198M",
			},
			{
				id: 9,
				title: "A Lonely Night",
				duration: "3:44",
				durationSecs: 224,
				plays: "234M",
			},
			{
				id: 10,
				title: "Attention",
				duration: "3:49",
				durationSecs: 229,
				plays: "189M",
			},
			{
				id: 11,
				title: "I Feel It Coming",
				duration: "4:29",
				durationSecs: 269,
				plays: "1.4B",
			},
		],
	},
	{
		id: 3,
		title: "Dawn FM",
		year: "2022",
		cover: "https://picsum.photos/seed/dawnfm/80/80",
		tracks: [
			{
				id: 1,
				title: "Dawn FM",
				duration: "1:36",
				durationSecs: 96,
				plays: "145M",
			},
			{
				id: 2,
				title: "Gasoline",
				duration: "3:32",
				durationSecs: 212,
				plays: "487M",
			},
			{
				id: 3,
				title: "How Do I Make You Love Me?",
				duration: "3:34",
				durationSecs: 214,
				plays: "356M",
			},
			{
				id: 4,
				title: "Take My Breath",
				duration: "3:39",
				durationSecs: 219,
				plays: "612M",
			},
			{
				id: 5,
				title: "Sacrifice",
				duration: "3:08",
				durationSecs: 188,
				plays: "534M",
			},
			{
				id: 6,
				title: "A Tale By Quincy",
				duration: "1:44",
				durationSecs: 104,
				plays: "112M",
			},
			{
				id: 7,
				title: "Out of Time",
				duration: "3:36",
				durationSecs: 216,
				plays: "423M",
			},
			{
				id: 8,
				title: "Here We Go… Again",
				duration: "4:04",
				durationSecs: 244,
				plays: "289M",
			},
			{
				id: 9,
				title: "Best Friends",
				duration: "3:13",
				durationSecs: 193,
				plays: "267M",
			},
			{
				id: 10,
				title: "Is There Someone Else?",
				duration: "3:13",
				durationSecs: 193,
				plays: "398M",
			},
		],
	},
];

// Helper: build a track object for the player
function toPlayerTrack(track, album) {
	return {
		id: `${album.id}-${track.id}`,
		title: track.title,
		artist: artist.name,
		cover: album.cover,
		duration: track.durationSecs,
	};
}

function TrackRow({ track, album, index }) {
	const { currentTrack, playing, playTrack, togglePlay } = usePlayer();
	const [liked, setLiked] = useState(false);
	const [hovered, setHovered] = useState(false);
	const trackId = `${album.id}-${track.id}`;
	const isActive = currentTrack?.id === trackId;
	const isPlaying = isActive && playing;

	const handleClick = () => {
		if (isActive) {
			togglePlay();
		} else {
			playTrack(toPlayerTrack(track, album));
		}
	};

	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={handleClick}
			className={`grid grid-cols-[40px_1fr_120px_80px_40px] gap-4 px-4 py-2.5 rounded-xl items-center cursor-pointer transition-all duration-150
        ${isActive ? "bg-violet-600/10 border border-violet-500/20" : "hover:bg-white/5"}`}
		>
			{/* Index / Play */}
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

			{/* Title */}
			<div className="flex items-center gap-3 min-w-0">
				<img
					src={album.cover}
					alt=""
					className="w-9 h-9 rounded-lg object-cover shrink-0 opacity-80"
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

			<span className="text-zinc-600 text-xs text-right">{track.plays}</span>
			<span className="text-zinc-500 text-sm text-right">{track.duration}</span>

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

function AlbumSection({ album }) {
	const { playTrack } = usePlayer();
	const [expanded, setExpanded] = useState(true);

	return (
		<div className="mb-10">
			<div
				className="flex items-center gap-4 mb-4 cursor-pointer group"
				onClick={() => setExpanded(!expanded)}
			>
				<img
					src={album.cover}
					alt={album.title}
					className="w-14 h-14 rounded-xl object-cover shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-200"
				/>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="text-white font-bold text-lg">{album.title}</h3>
						<Badge
							variant="outline"
							className="text-zinc-500 border-zinc-700 text-xs"
						>
							{album.year}
						</Badge>
					</div>
					<p className="text-zinc-500 text-sm">{album.tracks.length} tracks</p>
				</div>
				<button
					onClick={(e) => {
						e.stopPropagation();
						playTrack(toPlayerTrack(album.tracks[0], album));
					}}
					className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500 hover:scale-110 shadow-lg shadow-violet-900/50"
				>
					<Play size={14} fill="white" className="text-white ml-0.5" />
				</button>
				<span className="text-zinc-700 text-xs ml-2">
					{expanded ? "▲" : "▼"}
				</span>
			</div>

			{expanded && (
				<>
					<div className="grid grid-cols-[40px_1fr_120px_80px_40px] gap-4 px-4 py-2 mb-1 text-xs font-semibold text-zinc-700 uppercase tracking-wider border-b border-white/5">
						<span>#</span>
						<span>Title</span>
						<span className="text-right">Plays</span>
						<span className="flex items-center gap-1 justify-end">
							<Clock size={11} /> Time
						</span>
						<span />
					</div>
					{album.tracks.map((track, i) => (
						<TrackRow key={track.id} track={track} album={album} index={i} />
					))}
				</>
			)}
		</div>
	);
}

export default function ArtistPage() {
	const { currentTrack, playing, playTrack, togglePlay } = usePlayer();
	const [activeTab, setActiveTab] = useState("discography");
	const totalTracks = albums.reduce((acc, a) => acc + a.tracks.length, 0);

	const handlePlayAll = () => {
		const firstTrack = toPlayerTrack(albums[0].tracks[0], albums[0]);
		if (currentTrack?.id === firstTrack.id) {
			togglePlay();
		} else {
			playTrack(firstTrack);
		}
	};

	return (
		<div className="flex bg-zinc-950 min-h-screen text-white">
			<Sidebar />

			<div className="flex-1 overflow-y-auto pb-28">
				{/* Hero Banner */}
				<div className="relative h-80 overflow-hidden">
					<img
						src={artist.banner}
						alt={artist.name}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 to-transparent" />
					<div className="absolute bottom-0 left-0 px-8 pb-6 flex items-end gap-6">
						<img
							src={artist.avatar}
							alt={artist.name}
							className="w-24 h-24 rounded-2xl object-cover ring-4 ring-zinc-950 shadow-2xl"
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
								{artist.name}
							</h1>
							<div className="flex items-center gap-4 mt-1">
								<span className="text-zinc-400 text-sm flex items-center gap-1.5">
									<Users size={13} /> {artist.followers} followers
								</span>
								<span className="text-zinc-600">•</span>
								<span className="text-zinc-400 text-sm">
									{artist.monthlyListeners} monthly listeners
								</span>
								<span className="text-zinc-600">•</span>
								<span className="text-zinc-500 text-sm">{artist.genre}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Action bar */}
				<div className="px-8 py-5 flex items-center gap-4 border-b border-white/5">
					<Button
						onClick={handlePlayAll}
						className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-7 gap-2 shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95 transition-all duration-150"
					>
						{playing ? (
							<Pause size={15} fill="white" />
						) : (
							<Play size={15} fill="white" className="ml-0.5" />
						)}
						{playing ? "Pause" : "Play All"}
					</Button>
					<Button
						variant="outline"
						className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 gap-2"
					>
						<Shuffle size={15} />
						Shuffle
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

					{activeTab === "discography" && (
						<div>
							<p className="text-zinc-600 text-sm mb-6">
								{albums.length} albums · {totalTracks} songs
							</p>
							{albums.map((album) => (
								<AlbumSection key={album.id} album={album} />
							))}
						</div>
					)}

					{activeTab === "popular" && (
						<div>
							<p className="text-zinc-600 text-sm mb-6">
								Most played tracks across all albums
							</p>
							<div className="grid grid-cols-[40px_1fr_120px_80px_80px_40px] gap-4 px-4 py-2 mb-1 text-xs font-semibold text-zinc-700 uppercase tracking-wider border-b border-white/5">
								<span>#</span>
								<span>Title</span>
								<span>Album</span>
								<span className="text-right">Plays</span>
								<span className="flex items-center gap-1 justify-end">
									<Clock size={11} /> Time
								</span>
								<span />
							</div>
							{albums
								.flatMap((album) =>
									album.tracks.map((t) => ({
										...t,
										albumTitle: album.title,
										albumCover: album.cover,
										albumObj: album,
									})),
								)
								.sort((a, b) => parseFloat(b.plays) - parseFloat(a.plays))
								.slice(0, 10)
								.map((track, i) => {
									const trackId = `${track.albumObj.id}-${track.id}`;
									const isActive = currentTrack?.id === trackId;
									const isPlaying = isActive && playing;
									return (
										<div
											key={trackId}
											onClick={() =>
												isActive
													? togglePlay()
													: playTrack(toPlayerTrack(track, track.albumObj))
											}
											className={`grid grid-cols-[40px_1fr_120px_80px_80px_40px] gap-4 px-4 py-2.5 rounded-xl items-center cursor-pointer transition-all duration-150
                        ${isActive ? "bg-violet-600/10 border border-violet-500/20" : "hover:bg-white/5"}`}
										>
											<span
												className={`text-sm font-medium ${isActive ? "text-violet-400" : "text-zinc-600"}`}
											>
												{i + 1}
											</span>
											<div className="flex items-center gap-3 min-w-0">
												<img
													src={track.albumCover}
													alt=""
													className="w-9 h-9 rounded-lg object-cover shrink-0"
												/>
												<span
													className={`text-sm font-medium truncate ${isActive ? "text-violet-300" : "text-zinc-200"}`}
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
											<span className="text-zinc-500 text-xs truncate">
												{track.albumTitle}
											</span>
											<span className="text-zinc-600 text-xs text-right">
												{track.plays}
											</span>
											<span className="text-zinc-500 text-sm text-right">
												{track.duration}
											</span>
											<button className="text-zinc-700 hover:text-zinc-400 opacity-0 group-hover:opacity-100">
												<Heart size={15} />
											</button>
										</div>
									);
								})}
						</div>
					)}

					{activeTab === "about" && (
						<div className="max-w-2xl space-y-6">
							<div className="bg-zinc-900/60 rounded-2xl border border-white/5 p-6">
								<h3 className="text-white font-semibold mb-3">Biography</h3>
								<p className="text-zinc-400 text-sm leading-relaxed">
									{artist.bio}
								</p>
							</div>
							<div className="grid grid-cols-3 gap-4">
								{[
									{ label: "Followers", value: artist.followers, icon: Users },
									{
										label: "Monthly Listeners",
										value: artist.monthlyListeners,
										icon: Music2,
									},
									{ label: "Albums", value: albums.length, icon: Disc3 },
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
						</div>
					)}
				</div>
			</div>

			<MusicPlayer />
		</div>
	);
}
