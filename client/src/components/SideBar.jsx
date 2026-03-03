import { useNavigate, useLocation } from "react-router-dom";
import {
	Home,
	Search,
	Library,
	Heart,
	PlusSquare,
	Mic2,
	Radio,
	TrendingUp,
} from "lucide-react";

const navItems = [
	{ icon: Home, label: "Home", path: "/home"  },
	{ icon: Heart, label: "Liked Songs", path: "/like" },
	{ icon: Library, label: "Playlists", path: "/playlist"},
	// { icon: PlusSquare, label: "Create Playlist" },
	{ icon: Mic2, label: "Artists", path: "/artist"},
];

// const libraryItems = [

// ];

// const recentArtists = [
// 	{ name: "The Weeknd", img: "https://picsum.photos/seed/weeknd/40/40" },
// 	{ name: "Dua Lipa", img: "https://picsum.photos/seed/dualipa/40/40" },
// 	{ name: "Drake", img: "https://picsum.photos/seed/drake/40/40" },
// 	{ name: "Billie Eilish", img: "https://picsum.photos/seed/billie/40/40" },
// ];

export default function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();
	
	return (
		<aside className="w-64 min-h-screen bg-zinc-900 flex flex-col px-4 py-6 gap-8 border-r border-white/5 shrink-0">
			{/* Logo */}
			<div className="flex items-center gap-2 px-2">
				<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
					<span className="text-white text-xs font-black">M</span>
				</div>
				<span className="text-white font-black text-lg tracking-tight">
					Melodix
				</span>
			</div>

			{/* Main Nav */}
            <nav className="flex flex-col gap-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest px-3 mb-2 font-semibold">Menu</p>
                {navItems.map(({ icon: Icon, label, path }) => {
                    const active = location.pathname === path;
                    return (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left
                                ${active
                                    ? "bg-gradient-to-r from-violet-600/30 to-fuchsia-600/10 text-violet-300 border border-violet-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon size={18} className={active ? "text-violet-400" : ""} />
                            {label}
                        </button>
                    );
                })}
            </nav>

			{/* Library */}
			{/* <nav className="flex flex-col gap-1">
				<p className="text-xs text-zinc-500 uppercase tracking-widest px-3 mb-2 font-semibold">
					Library
				</p>
				{libraryItems.map(({ icon: Icon, label }) => (
					<button
						key={label}
						className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200 w-full text-left"
					>
						<Icon size={18} />
						{label}
					</button>
				))}
			</nav> */}

			{/* Recent Artists */}
			{/* <div className="mt-auto flex flex-col gap-3">
				<p className="text-xs text-zinc-500 uppercase tracking-widest px-2 font-semibold">
					Recent Artists
				</p>
				{recentArtists.map((artist) => (
					<button
						key={artist.name}
						className="flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-white/5 transition-all w-full text-left"
					>
						<img
							src={artist.img}
							alt={artist.name}
							className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
						/>
						<span className="text-sm text-zinc-400 hover:text-white transition-colors">
							{artist.name}
						</span>
					</button>
				))}
			</div> */}
		</aside>
	);
}
