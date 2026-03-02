import Sidebar from "@/components/Sidebar.jsx";
import PlaylistCard from "@/components/PlaylistCard.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import { Play, TrendingUp, Clock, MoreHorizontal, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";

let controller = null;

const playlists = [
	{
		title: "Chill Vibes",
		artist: "Various Artists",
		image: "https://picsum.photos/seed/chill/300/300",
		duration: "2h 14m",
	},
	{
		title: "Top Hits 2024",
		artist: "Curated",
		image: "https://picsum.photos/seed/tophits/300/300",
		duration: "1h 48m",
	},
	{
		title: "Workout Mix",
		artist: "Energy Boost",
		image: "https://picsum.photos/seed/workout/300/300",
		duration: "58m",
	},
	{
		title: "Deep Focus",
		artist: "Lo-fi Studio",
		image: "https://picsum.photos/seed/focus/300/300",
		duration: "3h 02m",
	},
	{
		title: "Indie Gems",
		artist: "Discovery",
		image: "https://picsum.photos/seed/indie/300/300",
		duration: "1h 30m",
	},
	{
		title: "Late Night Jazz",
		artist: "Jazz Collective",
		image: "https://picsum.photos/seed/jazz/300/300",
		duration: "2h 45m",
	},
	{
		title: "R&B Soul",
		artist: "Soul Sessions",
		image: "https://picsum.photos/seed/rnb/300/300",
		duration: "1h 22m",
	},
	{
		title: "Electronic",
		artist: "Club Nights",
		image: "https://picsum.photos/seed/electronic/300/300",
		duration: "2h 10m",
	},
];

const trendingTracks = [
	{
		rank: 1,
		title: "Blinding Lights",
		artist: "The Weeknd",
		album: "After Hours",
		duration: "3:20",
		img: "https://picsum.photos/seed/t1/40/40",
	},
	{
		rank: 2,
		title: "As It Was",
		artist: "Harry Styles",
		album: "Harry's House",
		duration: "2:47",
		img: "https://picsum.photos/seed/t2/40/40",
	},
	{
		rank: 3,
		title: "Levitating",
		artist: "Dua Lipa",
		album: "Future Nostalgia",
		duration: "3:24",
		img: "https://picsum.photos/seed/t3/40/40",
	},
	{
		rank: 4,
		title: "Stay",
		artist: "The Kid LAROI",
		album: "F*ck Love",
		duration: "2:21",
		img: "https://picsum.photos/seed/t4/40/40",
	},
	{
		rank: 5,
		title: "Ghost",
		artist: "Justin Bieber",
		album: "Justice",
		duration: "2:33",
		img: "https://picsum.photos/seed/t5/40/40",
	},
];

function LandingPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Set a timer to trigger the search
		const delayDebounceFn = setTimeout(() => {
			if (query.trim()) {
				searchTracks(query);
			}
		}, 50000); // Wait for 500ms of "silence"

		// Cleanup: This cancels the timer if the user types again before 500ms
		return () => clearTimeout(delayDebounceFn);
	}, [query]);

	const searchTracks = async (searchTerm) => {
		// If there's a previous request, abort it
		if (controller) {
			controller.abort();
		}

		// Create a new controller for the current request
		controller = new AbortController();

		try {
			const response = await axios.get(
				`https://corsproxy.io/?https://api.deezer.com/search?q=${searchTerm}`,
				{
					signal: controller.signal, // Link the request to the controller
				},
			);
			console.log(response.data);
		} catch (error) {
			if (axios.isCancel(error)) {
				console.log("Request canceled successfully");
			} else {
				console.error("Actual search error:", error);
			}
		}
	};

	return (
		<div className="flex bg-zinc-950 min-h-screen text-white">
			<Sidebar />

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto pb-28">
				{/* Top bar */}
				<div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between border-b border-white/5">
					{/* <div className="flex gap-3">
						{["All", "Music", "Podcasts", "Live"].map((tab, i) => (
							<button
								key={tab}
								className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
									i === 0
										? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
										: "text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700/60"
								}`}
							>
								{tab}
							</button>
						))}
					</div> */}
					<div className="relative w-full max-w-md">
						<input
							type="text"
							placeholder="Search songs, artists..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="w-full bg-zinc-800/70 text-white placeholder-zinc-400 
               px-4 py-2.5 pl-10 rounded-full 
               focus:outline-none focus:ring-2 
               focus:ring-violet-500/50 transition-all"
						/>

						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
						/>

						{/* Dropdown */}
						{query && (
							<div className="absolute top-14 w-full bg-zinc-900 border border-white/5 rounded-xl shadow-xl max-h-80 overflow-y-auto">
								{loading && (
									<p className="p-4 text-sm text-zinc-400">Searching...</p>
								)}

								{!loading && results.length === 0 && (
									<p className="p-4 text-sm text-zinc-400">No results found</p>
								)}

								{!loading &&
									results.slice(0, 8).map((track) => (
										<div
											key={track.id}
											className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
										>
											<img
												src={track.album.cover_small}
												alt={track.title}
												className="w-10 h-10 rounded-md"
											/>

											<div className="min-w-0">
												<p className="text-sm text-white truncate">
													{track.title}
												</p>
												<p className="text-xs text-zinc-400 truncate">
													{track.artist.name}
												</p>
											</div>
										</div>
									))}
							</div>
						)}
					</div>
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 ring-2 ring-violet-500/30" />
						<span className="text-sm font-medium text-zinc-300">Alex K.</span>
					</div>
				</div>

				<div className="px-8 py-8 space-y-12">
					{/* Hero Banner */}
					<section className="relative rounded-3xl overflow-hidden h-64 group cursor-pointer">
						<img
							src="https://picsum.photos/seed/hero-banner/1200/400"
							alt="Featured"
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
						/>
						<div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
						<div className="absolute inset-0 flex flex-col justify-center px-10 gap-3">
							<Badge className="w-fit bg-violet-600/80 backdrop-blur text-white border-violet-500/30 text-xs">
								🔥 Featured Artist
							</Badge>
							<h1 className="text-4xl font-black tracking-tight text-white drop-shadow-xl">
								The Weeknd
							</h1>
							<p className="text-zinc-400 text-sm max-w-xs">
								After Hours • 14 tracks • 56 min
							</p>
							<div className="flex items-center gap-3 mt-1">
								<Button className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-6 shadow-lg shadow-violet-900/50 gap-2 transition-all duration-200 hover:scale-105">
									<Play size={14} fill="white" />
									Play Now
								</Button>
								<Button
									variant="outline"
									className="rounded-full border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur"
								>
									View Album
								</Button>
							</div>
						</div>
					</section>

					{/* Featured Playlists */}
					<section>
						<div className="flex items-center justify-between mb-5">
							<h2 className="text-xl font-bold text-white">
								Featured Playlists
							</h2>
							<button className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
								See all →
							</button>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{playlists.map((pl) => (
								<PlaylistCard key={pl.title} {...pl} />
							))}
						</div>
					</section>

					{/* Trending Tracks */}
					<section>
						<div className="flex items-center justify-between mb-5">
							<div className="flex items-center gap-2">
								<TrendingUp size={20} className="text-violet-400" />
								<h2 className="text-xl font-bold text-white">Trending Now</h2>
							</div>
							<button className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
								See all →
							</button>
						</div>
						<div className="bg-zinc-900/60 rounded-2xl border border-white/5 overflow-hidden">
							<div className="grid grid-cols-[40px_1fr_1fr_80px_40px] gap-4 px-5 py-3 border-b border-white/5 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
								<span>#</span>
								<span>Title</span>
								<span>Album</span>
								<span className="flex items-center gap-1 justify-end">
									<Clock size={12} /> Time
								</span>
								<span />
							</div>
							{trendingTracks.map((track) => (
								<div
									key={track.title}
									className="grid grid-cols-[40px_1fr_1fr_80px_40px] gap-4 px-5 py-3 items-center hover:bg-white/5 transition-colors group cursor-pointer border-b border-white/[0.03] last:border-0"
								>
									<span className="text-zinc-600 text-sm font-medium group-hover:hidden">
										{track.rank}
									</span>
									<Play
										size={14}
										className="text-violet-400 hidden group-hover:block"
										fill="currentColor"
									/>
									<div className="flex items-center gap-3 min-w-0">
										<img
											src={track.img}
											alt={track.title}
											className="w-9 h-9 rounded-lg object-cover shrink-0"
										/>
										<div className="min-w-0">
											<p className="text-white text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
												{track.title}
											</p>
											<p className="text-zinc-500 text-xs truncate">
												{track.artist}
											</p>
										</div>
									</div>
									<span className="text-zinc-500 text-sm truncate">
										{track.album}
									</span>
									<span className="text-zinc-500 text-sm text-right">
										{track.duration}
									</span>
									<button className="text-zinc-700 hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100">
										<MoreHorizontal size={16} />
									</button>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>

			<MusicPlayer />
		</div>
	);
}
export default LandingPage;
