import { render, screen, fireEvent, act } from "@testing-library/react";
import Playlists from "../PlaylistPage";
import axios from "axios";

jest.mock("axios");

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

jest.mock("@/components/Sidebar.jsx", () => () => <div data-testid="sidebar" />);
jest.mock("@/components/MusicPlayer.jsx", () => () => <div data-testid="music-player" />);

const mockPlaylists = [
	{ _id: "pl-1", name: "Chill Vibes", playlistImage: null, playlistSongs: {} },
	{ _id: "pl-2", name: "Workout Mix", playlistImage: "img.jpg", playlistSongs: { a: 1, b: 2 } },
];

beforeEach(() => {
	jest.clearAllMocks();
	localStorage.setItem("token", "fake-token");
	axios.get.mockResolvedValue({ data: mockPlaylists });
});

describe("Playlists", () => {
	test("renders sidebar and music player", async () => {
		await act(async () => render(<Playlists />));

		expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("music-player")).toBeInTheDocument();
	});

	test("fetches and displays playlists", async () => {
		await act(async () => render(<Playlists />));

		expect(screen.getByText("Chill Vibes")).toBeInTheDocument();
		expect(screen.getByText("Workout Mix")).toBeInTheDocument();
	});

	test("shows correct song count", async () => {
		await act(async () => render(<Playlists />));

		expect(screen.getByText("0 songs")).toBeInTheDocument();
		expect(screen.getByText("2 songs")).toBeInTheDocument();
	});

	test("shows empty state when no playlists", async () => {
		axios.get.mockResolvedValue({ data: [] });

		await act(async () => render(<Playlists />));

		expect(screen.getByText("No playlists yet")).toBeInTheDocument();
	});

	test("navigates to playlist on card click", async () => {
		await act(async () => render(<Playlists />));

		fireEvent.click(screen.getByTestId("playlist-card-pl-1"));

		expect(mockNavigate).toHaveBeenCalledWith("/playlist/pl-1");
	});

	test("opens create playlist modal", async () => {
		await act(async () => render(<Playlists />));

		fireEvent.click(screen.getByTestId("new-playlist-btn"));

		expect(screen.getByText("Create Playlist")).toBeInTheDocument();
	});

	test("closes modal on cancel", async () => {
		await act(async () => render(<Playlists />));

		fireEvent.click(screen.getByTestId("new-playlist-btn"));
		fireEvent.click(screen.getByText("Cancel"));

		expect(screen.queryByText("Create Playlist")).not.toBeInTheDocument();
	});

	test("creates a new playlist and adds to list", async () => {
		axios.post.mockResolvedValue({
			data: { _id: "pl-3", name: "New Mix", playlistSongs: {} },
		});

		await act(async () => render(<Playlists />));

		fireEvent.click(screen.getByTestId("new-playlist-btn"));
		fireEvent.change(screen.getByTestId("playlist-name-input"), {
			target: { value: "New Mix" },
		});

		await act(async () => {
			fireEvent.click(screen.getByTestId("submit-playlist-btn"));
		});

		expect(axios.post).toHaveBeenCalledWith(
			"/api/playlist",
			expect.any(FormData),
			expect.any(Object)
		);
		expect(screen.getByText("New Mix")).toBeInTheDocument();
	});

	test("submit button disabled when name is empty", async () => {
		await act(async () => render(<Playlists />));

		fireEvent.click(screen.getByTestId("new-playlist-btn"));

		expect(screen.getByTestId("submit-playlist-btn")).toBeDisabled();
	});

	test("deletes a playlist and removes from list", async () => {
		axios.delete.mockResolvedValue({});

		await act(async () => render(<Playlists />));

		await act(async () => {
			fireEvent.click(screen.getByTestId("delete-playlist-btn-pl-1"));
		});

		expect(axios.delete).toHaveBeenCalledWith(
			"/api/playlist/pl-1",
			expect.any(Object)
		);
		expect(screen.queryByText("Chill Vibes")).not.toBeInTheDocument();
	});

	test("create playlist from empty state button", async () => {
		axios.get.mockResolvedValue({ data: [] });

		await act(async () => render(<Playlists />));

		fireEvent.click(screen.getByText("Create Playlist"));

		expect(screen.getByText("Create Playlist", { selector: "h2" })).toBeInTheDocument();
	});
});