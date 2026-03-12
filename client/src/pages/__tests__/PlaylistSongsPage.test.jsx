import { render, screen, fireEvent, act } from "@testing-library/react";
import PlaylistSongsPage from "../PlaylistSongsPage";
import axios from "axios";
import { usePlayer } from "../../context/PlayerContext";

jest.mock("axios");
jest.mock("../../context/PlayerContext");
jest.mock("react-router-dom", () => ({
	useParams: () => ({ id: "pl-1" }),
	useNavigate: () => jest.fn(),
}));
jest.mock("@/components/Sidebar.jsx", () => () => <div data-testid="sidebar" />);
jest.mock("@/components/MusicPlayer.jsx", () => () => <div data-testid="music-player" />);

const mockPlayTrack = jest.fn();
const mockPlayQueue = jest.fn();

const mockPlaylistData = {
	_id: "pl-1",
	name: "Chill Vibes",
	description: "My chill playlist",
	playlistImage: null,
	playlistSongs: {
		"track-1": { title: "Song One", artist: "Artist A", cover: "cover1.jpg", preview: "prev1.mp3", duration: 180 },
		"track-2": { title: "Song Two", artist: "Artist B", cover: "cover2.jpg", preview: "prev2.mp3", duration: 240 },
	},
};

beforeEach(() => {
	jest.clearAllMocks();
	localStorage.setItem("token", "fake-token");
	axios.get.mockResolvedValue({ data: mockPlaylistData });
	usePlayer.mockReturnValue({
		playTrack: mockPlayTrack,
		playQueue: mockPlayQueue,
		currentTrack: null,
		playing: false,
	});
});

describe("PlaylistSongsPage", () => {
	test("renders sidebar and music player", async () => {
		await act(async () => render(<PlaylistSongsPage />));

		expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("music-player")).toBeInTheDocument();
	});

	test("fetches and displays playlist name", async () => {
		await act(async () => render(<PlaylistSongsPage />));

		expect(screen.getByText("Chill Vibes")).toBeInTheDocument();
	});

	test("displays playlist description", async () => {
		await act(async () => render(<PlaylistSongsPage />));

		expect(screen.getByText("My chill playlist")).toBeInTheDocument();
	});

	test("displays songs from playlist", async () => {
		await act(async () => render(<PlaylistSongsPage />));

		expect(screen.getByText("Song One")).toBeInTheDocument();
		expect(screen.getByText("Song Two")).toBeInTheDocument();
		expect(screen.getByText("Artist A")).toBeInTheDocument();
	});

	test("shows correct song count", async () => {
		await act(async () => render(<PlaylistSongsPage />));

		expect(screen.getByText(/2 songs/i)).toBeInTheDocument();
	});

	test("shows empty state when no songs", async () => {
		axios.get.mockResolvedValue({
			data: { ...mockPlaylistData, playlistSongs: {} },
		});

		await act(async () => render(<PlaylistSongsPage />));

		expect(screen.getByText("No songs yet")).toBeInTheDocument();
	});

	test("play all button calls playQueue", async () => {
		await act(async () => render(<PlaylistSongsPage />));

		fireEvent.click(screen.getByTestId("play-all-btn"));

		expect(mockPlayQueue).toHaveBeenCalled();
	});

	test("play all button disabled when no songs", async () => {
		axios.get.mockResolvedValue({
			data: { ...mockPlaylistData, playlistSongs: {} },
		});

		await act(async () => render(<PlaylistSongsPage />));

		expect(screen.getByTestId("play-all-btn")).toBeDisabled();
	});

	test("plays song on double click", async () => {
		await act(async () => render(<PlaylistSongsPage />));

		const rows = screen.getAllByText("Song One");
		await act(async () => fireEvent.doubleClick(rows[0].closest(".grid")));

		expect(mockPlayTrack).toHaveBeenCalled();
	});

	test("removes song from playlist", async () => {
		axios.delete.mockResolvedValue({});

		await act(async () => render(<PlaylistSongsPage />));

		await act(async () => {
			fireEvent.click(screen.getByTestId("remove-song-btn-track-1"));
		});

		expect(axios.delete).toHaveBeenCalledWith(
			"/api/playlist/pl-1/tracks",
			expect.any(Object)
		);
		expect(screen.queryByText("Song One")).not.toBeInTheDocument();
	});

	test("shows success toast after removing song", async () => {
		axios.delete.mockResolvedValue({});

		await act(async () => render(<PlaylistSongsPage />));

		await act(async () => {
			fireEvent.click(screen.getByTestId("remove-song-btn-track-1"));
		});

		expect(screen.getByText("Song removed from playlist")).toBeInTheDocument();
	});

	test("shows error toast when remove fails", async () => {
		axios.delete.mockRejectedValue(new Error("fail"));
		jest.spyOn(console, "error").mockImplementation(() => {});

		await act(async () => render(<PlaylistSongsPage />));

		await act(async () => {
			fireEvent.click(screen.getByTestId("remove-song-btn-track-1"));
		});

		expect(screen.getByText("Failed to remove song")).toBeInTheDocument();

		console.error.mockRestore();
	});
});