import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import TrackMenu from "../TrackMenu";
import axios from "axios";

jest.mock("axios");

const mockOnClose = jest.fn();

const mockTrack = {
	id: "track-1",
	title: "Test Song",
	artist: "Test Artist",
	cover: "cover.jpg",
	preview: "preview.mp3",
	duration: 180,
};

const mockPlaylists = [
	{ _id: "pl-1", name: "Chill Vibes", playlistImage: null },
	{ _id: "pl-2", name: "Workout Mix", playlistImage: "img.jpg" },
];

beforeEach(() => {
	jest.clearAllMocks();
	localStorage.setItem("token", "fake-token");
	axios.get.mockResolvedValue({ data: mockPlaylists });
});

describe("TrackMenu", () => {
	test("shows loading then renders playlists", async () => {
		await act(async () => {
			render(<TrackMenu trackData={mockTrack} onClose={mockOnClose} />);
		});

		expect(screen.getByText("Chill Vibes")).toBeInTheDocument();
		expect(screen.getByText("Workout Mix")).toBeInTheDocument();
	});

	test("shows empty state when no playlists", async () => {
		axios.get.mockResolvedValue({ data: [] });

		await act(async () => {
			render(<TrackMenu trackData={mockTrack} onClose={mockOnClose} />);
		});

		expect(screen.getByText("No playlists yet")).toBeInTheDocument();
	});

	test("adds track to playlist and shows success toast", async () => {
		axios.post.mockResolvedValue({});

		await act(async () => {
			render(<TrackMenu trackData={mockTrack} onClose={mockOnClose} />);
		});

		await act(async () => {
			fireEvent.click(screen.getByTestId("add-to-playlist-pl-1"));
		});

		expect(axios.post).toHaveBeenCalledWith(
			"/api/playlist/pl-1/tracks",
			expect.objectContaining({ trackId: "track-1" }),
			expect.any(Object)
		);
		expect(screen.getByText("Song added to playlist")).toBeInTheDocument();
	});

	test("shows error toast when track already in playlist", async () => {
		axios.post.mockRejectedValue({
			response: { data: { error: "Track already in playlist" } },
		});

		await act(async () => {
			render(<TrackMenu trackData={mockTrack} onClose={mockOnClose} />);
		});

		await act(async () => {
			fireEvent.click(screen.getByTestId("add-to-playlist-pl-1"));
		});

		expect(screen.getByText("This song is already in the playlist")).toBeInTheDocument();
	});

	test("opens create playlist modal", async () => {
		await act(async () => {
			render(<TrackMenu trackData={mockTrack} onClose={mockOnClose} />);
		});

		fireEvent.click(screen.getByText("New Playlist"));

		expect(screen.getByText("Create Playlist")).toBeInTheDocument();
	});

	test("closes modal on cancel", async () => {
		await act(async () => {
			render(<TrackMenu trackData={mockTrack} onClose={mockOnClose} />);
		});

		fireEvent.click(screen.getByText("New Playlist"));
		fireEvent.click(screen.getByText("Cancel"));

		expect(screen.queryByText("Create Playlist")).not.toBeInTheDocument();
	});

	test("creates playlist and adds track", async () => {
		axios.post.mockResolvedValue({ data: { _id: "pl-new" } });

		await act(async () => {
			render(<TrackMenu trackData={mockTrack} onClose={mockOnClose} />);
		});

		fireEvent.click(screen.getByText("New Playlist"));
		fireEvent.change(screen.getByPlaceholderText("My Playlist"), {
			target: { value: "My New Playlist" },
		});

		await act(async () => {
			fireEvent.click(screen.getByText("Create & Add"));
		});

		expect(axios.post).toHaveBeenCalledWith(
			"/api/playlist",
			expect.any(FormData),
			expect.any(Object)
		);
	});
});