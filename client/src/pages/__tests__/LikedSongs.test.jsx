import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LikedSongs from "../LikedSongs";
import axios from "axios";
import { usePlayer } from "../../context/PlayerContext";

jest.mock("axios");
jest.mock("../../context/PlayerContext");
jest.mock("@/components/Sidebar.jsx", () => () => <div data-testid="sidebar" />);
jest.mock("@/components/MusicPlayer.jsx", () => () => <div data-testid="music-player" />);
jest.mock("@/components/TrackMenu", () => ({ trackData, onClose }) => (
	<div data-testid="track-menu">
		<button onClick={onClose}>Close Menu</button>
	</div>
));

const mockPlayTrack = jest.fn();
const mockPlayQueue = jest.fn();

const mockSongs = [
	{ id: "1", title: "Song One", artist: "Artist A", cover: "cover1.jpg", preview: "prev1.mp3", duration: 180 },
	{ id: "2", title: "Song Two", artist: "Artist B", cover: "cover2.jpg", preview: "prev2.mp3", duration: 240 },
];

beforeEach(() => {
	jest.clearAllMocks();
	localStorage.setItem("token", "fake-token");
	axios.get.mockResolvedValue({ data: { likedSongs: mockSongs } });
	usePlayer.mockReturnValue({
		playTrack: mockPlayTrack,
		playQueue: mockPlayQueue,
		currentTrack: null,
		playing: false,
	});
});

describe("LikedSongs", () => {
	test("renders sidebar and music player", async () => {
		await act(async () => render(<LikedSongs />));

		expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("music-player")).toBeInTheDocument();
	});

	test("fetches and displays liked songs", async () => {
		await act(async () => render(<LikedSongs />));

		expect(screen.getByText("Song One")).toBeInTheDocument();
		expect(screen.getByText("Song Two")).toBeInTheDocument();
		expect(screen.getByText("Artist A")).toBeInTheDocument();
	});

	test("shows song count", async () => {
		await act(async () => render(<LikedSongs />));

		expect(screen.getByText(/2 songs/i)).toBeInTheDocument();
	});

	test("shows empty state when no liked songs", async () => {
		axios.get.mockResolvedValue({ data: { likedSongs: [] } });

		await act(async () => render(<LikedSongs />));

		expect(screen.getByText("No liked songs yet")).toBeInTheDocument();
	});

	test("plays song on double click", async () => {
		await act(async () => render(<LikedSongs />));

		const rows = screen.getAllByText("Song One");
		await act(async () => fireEvent.doubleClick(rows[0].closest(".grid")));

		expect(mockPlayTrack).toHaveBeenCalled();
	});

	test("plays full queue on main play button", async () => {
		await act(async () => render(<LikedSongs />));

		fireEvent.click(screen.getAllByRole("button")[0]);

		expect(mockPlayQueue).toHaveBeenCalled();
	});

	test("unlikes a song and removes it from list", async () => {
		axios.put.mockResolvedValue({});

		await act(async () => render(<LikedSongs />));

		const unlikeBtns = screen.getAllByTitle("Remove from liked songs");
		await act(async () => fireEvent.click(unlikeBtns[0]));

		expect(axios.put).toHaveBeenCalledWith(
			"/api/user/like",
			{ trackId: "1" },
			expect.any(Object)
		);
		expect(screen.queryByText("Song One")).not.toBeInTheDocument();
	});

	test("shows success toast after unliking", async () => {
		axios.put.mockResolvedValue({});

		await act(async () => render(<LikedSongs />));

		const unlikeBtns = screen.getAllByTitle("Remove from liked songs");
		await act(async () => fireEvent.click(unlikeBtns[0]));

		expect(screen.getByText("Song removed from liked songs")).toBeInTheDocument();
	});

	test("shows error toast when unlike fails", async () => {
		axios.put.mockRejectedValue(new Error("fail"));
		jest.spyOn(console, "error").mockImplementation(() => {});

		await act(async () => render(<LikedSongs />));

		const unlikeBtns = screen.getAllByTitle("Remove from liked songs");
		await act(async () => fireEvent.click(unlikeBtns[0]));

		expect(screen.getByText("Failed to remove song")).toBeInTheDocument();

		console.error.mockRestore();
	});

	test("opens track menu on 3-dot button click", async () => {
		await act(async () => render(<LikedSongs />));

		await act(async () => {
			fireEvent.click(screen.getByTestId("liked-menu-btn-1"));
		});

		expect(screen.getByTestId("track-menu")).toBeInTheDocument();
	});

	test("closes track menu on close", async () => {
		await act(async () => render(<LikedSongs />));

		await act(async () => {
			fireEvent.click(screen.getByTestId("liked-menu-btn-1"));
		});

		await act(async () => {
			fireEvent.click(screen.getByText("Close Menu"));
		});

		expect(screen.queryByTestId("track-menu")).not.toBeInTheDocument();
	});
});