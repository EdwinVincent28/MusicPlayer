export function formatDuration(seconds) {
	if (!seconds) return "--:--";
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function songCount(playlist) {
	if (!playlist.playlistSongs) return 0;
	if (playlist.playlistSongs instanceof Map) return playlist.playlistSongs.size;
	return Object.keys(playlist.playlistSongs).length;
}

export function formatFans(n) {
	if (!n) return "—";
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toString();
}
