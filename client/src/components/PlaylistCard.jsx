import { Play } from "lucide-react";

export default function PlaylistCard({ title, image, artist, duration }) {
	return (
		<div className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/20 cursor-pointer">
			{/* Image */}
			<div className="relative aspect-square overflow-hidden">
				<img
					src={image}
					alt={title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
				/>
				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />

				{/* Play button */}
				<button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-900/50 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-violet-400 hover:scale-110">
					<Play size={16} fill="white" className="text-white ml-0.5" />
				</button>
			</div>

			{/* Info */}
			<div className="p-3">
				<h3 className="text-white font-semibold text-sm truncate">{title}</h3>
				{artist && (
					<p className="text-zinc-500 text-xs mt-0.5 truncate">{artist}</p>
				)}
				{duration && <p className="text-zinc-600 text-xs mt-1">{duration}</p>}
			</div>
		</div>
	);
}
