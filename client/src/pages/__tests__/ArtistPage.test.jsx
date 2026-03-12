import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ArtistPage from "../ArtistPage";
import axios from "axios";
import { usePlayer } from "../../context/PlayerContext";

jest.mock("axios");

jest.mock("../../context/PlayerContext", () => ({
	usePlayer: jest.fn(),
}));

jest.mock("@/components/Sidebar.jsx", () => () => (
	<div data-testid="sidebar" />
));

jest.mock("@/components/MusicPlayer.jsx", () => () => (
	<div data-testid="music-player" />
));

const mockArtist = {
	id: 27,
	name: "Daft Punk",
	picture_medium: "medium.jpg",
	picture_big: "big.jpg",
	picture_xl: "xl.jpg",
	nb_fan: 4200000,
	nb_album: 12,
	link: "https://deezer.com/artist/27",
};

const mockTracks = [
	{
		id: 1,
		title: "Get Lucky",
		duration: 248,
		rank: 950000,
		preview: "preview.mp3",
		album: { cover_medium: "cover.jpg", cover_small: "cover_s.jpg" },
	},
];

const mockAlbums = [
	{
		id: 10,
		title: "Random Access Memories",
		cover_medium: "ram.jpg",
		cover_small: "ram_s.jpg",
		release_date: "2013-05-17",
		record_type: "album",
	},
];

const mockAlbumTracks = [
	{
		id: 100,
		title: "Instant Crush",
		duration: 300,
		rank: 500000,
		preview: "instant.mp3",
	},
];

const mockPlayer = {
	currentTrack: null,
	playing: false,
	playTrack: jest.fn(),
	playQueue: jest.fn(),
	togglePlay: jest.fn(),
};

function renderPage() {
	return render(
		<MemoryRouter initialEntries={["/artist/27"]}>
			<Routes>
				<Route path="/artist/:id" element={<ArtistPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

beforeEach(() => {
	jest.clearAllMocks();

	localStorage.setItem("token", "fake-token");

	usePlayer.mockReturnValue(mockPlayer);

	axios.get.mockImplementation((url) => {
		if (url.includes("/artist/27/top"))
			return Promise.resolve({ data: { data: mockTracks } });

		if (url.includes("/artist/27/albums"))
			return Promise.resolve({ data: { data: mockAlbums } });

		if (url.includes("/album/"))
			return Promise.resolve({ data: { data: mockAlbumTracks } });

		if (url.includes("/artist/27"))
			return Promise.resolve({ data: mockArtist });

		if (url.includes("/api/user/following"))
			return Promise.resolve({ data: { following: false } });

		return Promise.resolve({ data: {} });
	});

	axios.put.mockResolvedValue({});
});

describe("ArtistPage", () => {
	test("renders sidebar and music player", async () => {
		await act(async () => renderPage());

		expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("music-player")).toBeInTheDocument();
	});

	test("renders artist name", async () => {
		await act(async () => renderPage());

		expect(screen.getByText("Daft Punk")).toBeInTheDocument();
	});

	test("shows formatted fan count", async () => {
		await act(async () => renderPage());

		expect(screen.getByText(/4.2M fans/i)).toBeInTheDocument();
	});

	test("renders album in discography", async () => {
		await act(async () => renderPage());

		expect(screen.getByText("Random Access Memories")).toBeInTheDocument();
	});

	test("album tracks load", async () => {
		await act(async () => renderPage());

		expect(screen.getByText("Instant Crush")).toBeInTheDocument();
	});

	test("switches to Popular Tracks tab", async () => {
		await act(async () => renderPage());

		fireEvent.click(screen.getByTestId("tab-popular"));

		expect(screen.getByText("Get Lucky")).toBeInTheDocument();
	});

	test("switches to About tab", async () => {
		await act(async () => renderPage());

		fireEvent.click(screen.getByTestId("tab-about"));

		expect(screen.getByText("Fans")).toBeInTheDocument();
	});

	test("play all button triggers playQueue", async () => {
		const playQueue = jest.fn();

		usePlayer.mockReturnValue({ ...mockPlayer, playQueue });

		await act(async () => renderPage());

		fireEvent.click(screen.getAllByTestId("play-btn")[0]);

		expect(playQueue).toHaveBeenCalled();
	});

	test("play all toggles pause when already playing", async () => {
		const togglePlay = jest.fn();

		usePlayer.mockReturnValue({
			...mockPlayer,
			currentTrack: { artistId: 27 },
			playing: true,
			togglePlay,
		});

		await act(async () => renderPage());

		fireEvent.click(screen.getAllByTestId("play-btn")[0]);

		expect(togglePlay).toHaveBeenCalled();
	});

	test("follow button calls API", async () => {
		await act(async () => renderPage());

		await act(async () => {
			fireEvent.click(screen.getByTestId("follow-btn"));
		});

		expect(axios.put).toHaveBeenCalled();
	});

	test("like button toggles", async () => {
		await act(async () => renderPage());

		fireEvent.click(screen.getByTestId("tab-popular"));

		const likeBtn = screen.getAllByTestId("like-btn")[0];

		fireEvent.click(likeBtn);

		expect(likeBtn).toBeInTheDocument();
	});

	test("collapses album section", async () => {
		await act(async () => renderPage());

		const album = screen.getByText("Random Access Memories");

		fireEvent.click(album);

		expect(screen.queryByText("Instant Crush")).not.toBeInTheDocument();
	});

	test("handles empty albums", async () => {
		axios.get.mockImplementation((url) => {
			if (url.includes("/albums"))
				return Promise.resolve({ data: { data: [] } });

			if (url.includes("/artist/27"))
				return Promise.resolve({ data: mockArtist });

			if (url.includes("/top")) return Promise.resolve({ data: { data: [] } });

			return Promise.resolve({ data: {} });
		});

		await act(async () => renderPage());

		expect(screen.getByText("0 releases")).toBeInTheDocument();
	});

	test("handles API failure gracefully", async () => {
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		axios.get.mockRejectedValue(new Error("API error"));

		await act(async () => renderPage());

		expect(screen.getByTestId("sidebar")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});
});
