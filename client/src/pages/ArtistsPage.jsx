import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import Sidebar from "@/components/Sidebar.jsx";
import MusicPlayer from "@/components/MusicPlayer.jsx";
import { Search, Users, TrendingUp, X } from "lucide-react";

// Curated list of well-known artist IDs from Deezer
const FEATURED_IDS = [
	27, 13, 384236, 1118489, 246791, 75798, 9635624, 4050205, 7706891, 1424602,
	564, 1032, 3928, 145, 43,
];

function ArtistCard({ artist, onClick, style }) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			onClick={() => onClick(artist)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={style}
			className="group relative cursor-pointer rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/20"
		>
			{/* Artist image */}
			<div className="relative aspect-square overflow-hidden">
				<img
					src={artist.picture_xl || artist.picture_big || artist.picture_medium}
					alt={artist.name}
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					onError={(e) => {
						e.target.src = `https://picsum.photos/seed/${artist.id}/300/300`;
					}}
				/>
				{/* Dark overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />

				{/* Hover play glow */}
				{hovered && (
					<div className="absolute inset-0 bg-violet-600/10 transition-opacity duration-200" />
				)}
			</div>

			{/* Info */}
			<div className="p-4">
				<h3 className="text-white font-bold text-sm truncate group-hover:text-violet-300 transition-colors">
					{artist.name}
				</h3>
				<p className="text-zinc-500 text-xs mt-1">
					{artist.nb_fan
						? `${(artist.nb_fan / 1000000).toFixed(1)}M fans`
						: "Artist"}
				</p>
			</div>
		</div>
	);
}

function ArtistCardSkeleton() {
	return (
		<div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 animate-pulse">
			<div className="aspect-square bg-zinc-800" />
			<div className="p-4 space-y-2">
				<div className="h-3 bg-zinc-800 rounded w-3/4" />
				<div className="h-2 bg-zinc-800 rounded w-1/2" />
			</div>
		</div>
	);
}

export default function ArtistsPage() {
	const navigate = useNavigate();

	// Search state
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const controllerRef = useRef(null);

	// Featured artists state
	const [featuredArtists, setFeaturedArtists] = useState([]);
	const [featuredLoading, setFeaturedLoading] = useState(true);

	// Fetch featured artists on mount
	useEffect(() => {
		const fetchFeatured = async () => {
			try {
				const requests = FEATURED_IDS.map((id) =>
					axios.get(`/api/deezer/artist/${id}`),
				);
				const responses = await Promise.allSettled(requests);
				const artists = responses
					.filter((r) => r.status === "fulfilled")
					.map((r) => r.value.data.data)
					.filter((a) => a && a.id);
				setFeaturedArtists(artists);
			} catch (err) {
				console.error("Failed to fetch featured artists", err);
			} finally {
				setFeaturedLoading(false);
			}
		};
		fetchFeatured();
	}, []);

	// Debounced search
	useEffect(() => {
		if (!query.trim()) {
			setSearchResults([]);
			setHasSearched(false);
			return;
		}

		const debounce = setTimeout(() => searchArtists(query), 500);
		return () => clearTimeout(debounce);
	}, [query]);

	const searchArtists = async (term) => {
		if (controllerRef.current) controllerRef.current.abort();
		controllerRef.current = new AbortController();

		setSearchLoading(true);
		setHasSearched(true);

		try {
			const response = await axios.get(
				`/api/deezer/search/artist?q=${encodeURIComponent(term)}&limit=20`,
				{ signal: controllerRef.current.signal },
			);
			setSearchResults(response.data?.data || []);
		} catch (err) {
			if (!axios.isCancel(err)) {
				console.error("Artist search error:", err);
				setSearchResults([]);
			}
		} finally {
			setSearchLoading(false);
		}
	};

	const handleArtistClick = (artist) => {
		// Pass artist data via navigation state so ArtistPage can use it
		navigate(`/artist/${artist.id}`, { state: { artist } });
	};

	const clearSearch = () => {
		setQuery("");
		setSearchResults([]);
		setHasSearched(false);
	};

	const showFeatured = !query.trim();
	const displayArtists = showFeatured ? featuredArtists : searchResults;
	const isLoading = showFeatured ? featuredLoading : searchLoading;

	return (
		<div className="flex bg-zinc-950 min-h-screen text-white">
			<Sidebar />

			<div className="flex-1 overflow-y-auto pb-28">
				{/* Sticky header */}
				<div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-8 py-5">
					<div className="flex items-center justify-between gap-6">
						<div>
							<h1 className="text-2xl font-black tracking-tight text-white">
								Artists
							</h1>
							<p className="text-zinc-500 text-sm mt-0.5">
								{showFeatured
									? "Featured & popular artists"
									: `${searchResults.length} results for "${query}"`}
							</p>
						</div>

						{/* Search bar */}
						<div className="relative w-full max-w-sm">
							<Search
								size={16}
								className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
							/>
							<input
								type="text"
								placeholder="Search artists..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-full bg-zinc-800/80 text-white placeholder-zinc-500 pl-10 pr-10 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
							/>
							{query && (
								<button
									onClick={clearSearch}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
									data-testid="clear-search"
								>
									<X size={15} />
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="px-8 py-8">
					{/* Section label */}
					<div className="flex items-center gap-2 mb-6">
						{showFeatured ? (
							<>
								<TrendingUp size={18} className="text-violet-400" />
								<h2 className="text-base font-bold text-white">
									Featured Artists
								</h2>
							</>
						) : (
							<>
								<Users size={18} className="text-violet-400" />
								<h2 className="text-base font-bold text-white">
									Search Results
								</h2>
							</>
						)}
					</div>

					{/* Loading skeletons */}
					{isLoading && (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{Array.from({ length: 10 }).map((_, i) => (
								<ArtistCardSkeleton key={i} />
							))}
						</div>
					)}

					{/* No results */}
					{!isLoading && hasSearched && searchResults.length === 0 && (
						<div className="flex flex-col items-center justify-center py-24 gap-4">
							<div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
								<Users size={36} className="text-zinc-700" />
							</div>
							<p className="text-white font-semibold text-lg">
								No artists found
							</p>
							<p className="text-zinc-500 text-sm">Try a different name</p>
						</div>
					)}

					{/* Artist grid */}
					{!isLoading && displayArtists.length > 0 && (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{displayArtists.map((artist, i) => (
								<ArtistCard
									key={artist.id}
									artist={artist}
									onClick={handleArtistClick}
									style={{ animationDelay: `${i * 40}ms` }}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<MusicPlayer />
		</div>
	);
}
