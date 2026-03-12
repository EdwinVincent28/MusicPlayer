/**
 * @jest-environment jsdom
 */
import React from "react";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from "@testing-library/react";
import axios from "axios";
import LandingPage from "../LandingPage";
import { usePlayer } from "../../context/PlayerContext";

jest.mock("axios");
jest.mock("../../context/PlayerContext");

jest.mock("react-router-dom", () => ({
	useNavigate: () => jest.fn(),
	useParams: () => ({}),
}));

jest.mock("jwt-decode", () => ({
	jwtDecode: () => ({ _id: "user-123" }),
}));

jest.mock("@/components/Sidebar.jsx", () => () => (
	<div data-testid="sidebar" />
));
jest.mock("@/components/MusicPlayer.jsx", () => () => (
	<div data-testid="music-player" />
));
jest.mock("@/components/PlaylistCard.jsx", () => () => (
	<div data-testid="playlist-card" />
));
jest.mock("@/components/TrackMenu", () => ({ trackData, onClose }) => (
	<div data-testid={`track-menu-${trackData.id}`}>
		<button onClick={onClose}>Close</button>
	</div>
));
jest.mock("@/components/ui/badge", () => ({
	Badge: ({ children, className }) => (
		<span className={className}>{children}</span>
	),
}));
jest.mock("@/components/ui/button", () => ({
	Button: ({
		children,
		onClick,
		"data-testid": testid,
		disabled,
		className,
	}) => (
		<button
			onClick={onClick}
			data-testid={testid}
			disabled={disabled}
			className={className}
		>
			{children}
		</button>
	),
}));

beforeAll(() => {
	jest.spyOn(console, "error").mockImplementation(() => {});
	jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
	console.error.mockRestore();
	console.log.mockRestore();
});

const mockTrack = (overrides = {}) => ({
	id: 1,
	title: "Get Lucky",
	duration: 248,
	preview: "https://cdn.example.com/preview.mp3",
	artist: { name: "Daft Punk" },
	album: {
		title: "Random Access Memories",
		cover_small: "https://example.com/cover_s.jpg",
		cover_medium: "https://example.com/cover_m.jpg",
		cover_xl: "https://example.com/cover_xl.jpg",
	},
	...overrides,
});

const mockTracks = [
	mockTrack({ id: 1, title: "Get Lucky" }),
	mockTrack({
		id: 2,
		title: "Harder Better Faster",
		artist: { name: "Daft Punk" },
		album: {
			title: "Alive 2007",
			cover_small: "https://example.com/cover_s2.jpg",
			cover_medium: "https://example.com/cover_m2.jpg",
		},
	}),
	mockTrack({
		id: 3,
		title: "One More Time",
		artist: { name: "Daft Punk" },
		album: {
			title: "Homework",
			cover_small: "https://example.com/cover_s3.jpg",
			cover_medium: "https://example.com/cover_m3.jpg",
		},
	}),
];

const mockPlaylists = [
	{
		id: 10,
		name: "Top Hits",
		title: "Top Hits",
		nb_tracks: 30,
		picture_medium: "https://example.com/pl1.jpg",
	},
	{
		id: 11,
		name: "Chill Mix",
		title: "Chill Mix",
		nb_tracks: 20,
		picture_medium: "https://example.com/pl2.jpg",
	},
];

const mockAlbums = [
	{
		id: 20,
		title: "RAM",
		artist: { name: "Daft Punk" },
		cover_medium: "https://example.com/al1.jpg",
	},
	{
		id: 21,
		title: "Discovery",
		artist: { name: "Daft Punk" },
		cover_medium: "https://example.com/al2.jpg",
	},
];

const mockUser = { _id: "user-123", username: "testuser", profileImage: "" };

const mockPlayerContext = {
	playTrack: jest.fn(),
	playQueue: jest.fn(),
	togglePlay: jest.fn(),
	currentTrack: null,
	playing: false,
};

function setupAxios() {
	axios.get.mockImplementation((url) => {
		if (url.includes("/api/user/")) return Promise.resolve({ data: mockUser });
		if (url.includes("/chart/0/tracks"))
			return Promise.resolve({ data: { data: mockTracks } });
		if (url.includes("/chart/0/playlists"))
			return Promise.resolve({ data: { data: mockPlaylists } });
		if (url.includes("/chart/0/albums"))
			return Promise.resolve({ data: { data: mockAlbums } });
		if (url.includes("/api/deezer/search"))
			return Promise.resolve({ data: { results: mockTracks } });
		return Promise.reject(new Error("Unknown URL: " + url));
	});
}

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers();
	localStorage.setItem("token", "fake-token");
	usePlayer.mockReturnValue({ ...mockPlayerContext });
	setupAxios();
});

afterEach(() => {
	jest.runOnlyPendingTimers();
	jest.useRealTimers();
});

async function renderAndLoad() {
	await act(async () => render(<LandingPage />));
	await act(async () => {});
}

describe("LandingPage", () => {
	describe("Layout", () => {
		it("renders sidebar", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		});

		it("renders music player", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("music-player")).toBeInTheDocument();
		});

		it("renders search input", async () => {
			await renderAndLoad();
			expect(
				screen.getByPlaceholderText("Search songs, artists..."),
			).toBeInTheDocument();
		});

		it("renders username in top bar", async () => {
			await renderAndLoad();
			await waitFor(() =>
				expect(screen.getByText("testuser")).toBeInTheDocument(),
			);
		});

		it("renders Trending Songs section heading", async () => {
			await renderAndLoad();
			expect(screen.getByText("Trending Songs")).toBeInTheDocument();
		});

		it("renders Trending Playlists section heading", async () => {
			await renderAndLoad();
			expect(screen.getByText("Trending Playlists")).toBeInTheDocument();
		});

		it("renders Trending Albums section heading", async () => {
			await renderAndLoad();
			expect(screen.getByText("Trending Albums")).toBeInTheDocument();
		});

		it("renders See All buttons for each section", async () => {
			await renderAndLoad();
			expect(
				screen.getByTestId("see-all-trending-playlists"),
			).toBeInTheDocument();
			expect(screen.getByTestId("see-all-trending-albums")).toBeInTheDocument();
		});
	});

	describe("Hero banner", () => {
		it("shows skeleton while loading", () => {
			axios.get.mockImplementation(() => new Promise(() => {}));
			render(<LandingPage />);
			expect(screen.queryByText("Get Lucky")).not.toBeInTheDocument();
		});

		it("displays #1 trending track title in hero", async () => {
			await renderAndLoad();
			// The first track becomes the featured hero
			expect(screen.getAllByText("Get Lucky").length).toBeGreaterThan(0);
		});

		it("displays featured artist name in hero", async () => {
			await renderAndLoad();
			expect(screen.getAllByText("Daft Punk").length).toBeGreaterThan(0);
		});

		it("renders #1 Trending badge", async () => {
			await renderAndLoad();
			expect(screen.getByText("🔥 #1 Trending")).toBeInTheDocument();
		});

		it("renders Play All button in hero", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("play-featured-btn")).toBeInTheDocument();
		});

		it("renders View Chart button in hero", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("view-chart-btn")).toBeInTheDocument();
		});

		it("Play All calls playQueue with all trending tracks", async () => {
			const playQueue = jest.fn();
			usePlayer.mockReturnValue({ ...mockPlayerContext, playQueue });
			await renderAndLoad();
			fireEvent.click(screen.getByTestId("play-featured-btn"));
			expect(playQueue).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({ title: "Get Lucky" }),
				]),
				0,
			);
		});

		it("shows Pause when featured track is playing", async () => {
			usePlayer.mockReturnValue({
				...mockPlayerContext,
				currentTrack: { id: 1 },
				playing: true,
			});
			await renderAndLoad();
			expect(screen.getByTestId("play-featured-btn")).toHaveTextContent(
				/pause/i,
			);
		});

		it("calls togglePlay when already playing", async () => {
			const togglePlay = jest.fn();
			usePlayer.mockReturnValue({
				...mockPlayerContext,
				currentTrack: { id: 1 },
				playing: true,
				togglePlay,
			});
			await renderAndLoad();
			fireEvent.click(screen.getByTestId("play-featured-btn"));
			expect(togglePlay).toHaveBeenCalled();
		});
	});

	describe("Trending tracks table", () => {
		it("shows skeleton rows while loading", () => {
			axios.get.mockImplementation(() => new Promise(() => {}));
			render(<LandingPage />);
			expect(screen.queryByText("Get Lucky")).not.toBeInTheDocument();
		});

		it("renders track titles after loading", async () => {
			await renderAndLoad();
			expect(screen.getAllByText("Get Lucky").length).toBeGreaterThan(0);
			expect(screen.getByText("Harder Better Faster")).toBeInTheDocument();
		});

		it("renders album title in track row", async () => {
			await renderAndLoad();
			expect(
				screen.getAllByText("Random Access Memories").length,
			).toBeGreaterThan(0);
		});

		it("renders formatted track duration", async () => {
			await renderAndLoad();
			// 248s = 4:08
			expect(screen.getAllByText("4:08").length).toBeGreaterThan(0);
		});

		it("renders row numbers", async () => {
			await renderAndLoad();
			expect(screen.getByText("1")).toBeInTheDocument();
			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("clicking a track row calls playQueue", async () => {
			const playQueue = jest.fn();
			usePlayer.mockReturnValue({ ...mockPlayerContext, playQueue });
			await renderAndLoad();
			const rows = screen.getAllByText("Harder Better Faster");
			fireEvent.click(rows[0].closest(".grid"));
			expect(playQueue).toHaveBeenCalled();
		});

		it("clicking active track row calls togglePlay", async () => {
			const togglePlay = jest.fn();
			usePlayer.mockReturnValue({
				...mockPlayerContext,
				currentTrack: { id: 2 },
				playing: true,
				togglePlay,
			});
			await renderAndLoad();
			const rows = screen.getAllByText("Harder Better Faster");
			fireEvent.click(rows[0].closest(".grid"));
			expect(togglePlay).toHaveBeenCalled();
		});

		it("renders chart menu button for each track", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("chart-menu-btn-1")).toBeInTheDocument();
			expect(screen.getByTestId("chart-menu-btn-2")).toBeInTheDocument();
		});

		it("clicking chart menu button opens TrackMenu", async () => {
			await renderAndLoad();
			fireEvent.click(screen.getByTestId("chart-menu-btn-1"));
			expect(screen.getByTestId("track-menu-1")).toBeInTheDocument();
		});

		it("clicking Close in TrackMenu closes it", async () => {
			await renderAndLoad();
			fireEvent.click(screen.getByTestId("chart-menu-btn-1"));
			fireEvent.click(screen.getByText("Close"));
			expect(screen.queryByTestId("track-menu-1")).not.toBeInTheDocument();
		});

		it("clicking same menu button twice closes the menu", async () => {
			await renderAndLoad();
			fireEvent.click(screen.getByTestId("chart-menu-btn-1"));
			fireEvent.click(screen.getByTestId("chart-menu-btn-1"));
			expect(screen.queryByTestId("track-menu-1")).not.toBeInTheDocument();
		});
	});

	describe("Trending Playlists", () => {
		it("renders playlist titles", async () => {
			await renderAndLoad();
			expect(screen.getByText("Top Hits")).toBeInTheDocument();
			expect(screen.getByText("Chill Mix")).toBeInTheDocument();
		});

		it("renders playlist track counts", async () => {
			await renderAndLoad();
			expect(screen.getByText("30 tracks")).toBeInTheDocument();
			expect(screen.getByText("20 tracks")).toBeInTheDocument();
		});

		it("renders play buttons for playlists", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("play-btn-playlist-10")).toBeInTheDocument();
		});
	});

	describe("Trending Albums", () => {
		it("renders album titles", async () => {
			await renderAndLoad();
			expect(screen.getByText("RAM")).toBeInTheDocument();
			expect(screen.getByText("Discovery")).toBeInTheDocument();
		});

		it("renders album artist names", async () => {
			await renderAndLoad();
			expect(screen.getAllByText("Daft Punk").length).toBeGreaterThan(0);
		});

		it("renders play buttons for albums", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("play-btn-album-20")).toBeInTheDocument();
		});
	});

	describe("Search", () => {
		it("does not show dropdown before typing", async () => {
			await renderAndLoad();
			expect(screen.queryByTestId("search-dropdown")).not.toBeInTheDocument();
		});

		it("does not call search API immediately on input (debounced)", async () => {
			await renderAndLoad();
			axios.get.mockClear();

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "Daft" },
				},
			);

			expect(axios.get).not.toHaveBeenCalled();
		});

		it("calls search API after 500ms debounce", async () => {
			await renderAndLoad();
			axios.get.mockClear();
			axios.get.mockResolvedValue({ data: { results: mockTracks } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "Daft" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));

			expect(axios.get).toHaveBeenCalledWith(
				expect.stringContaining("Daft"),
				expect.any(Object),
			);
		});

		it("shows search dropdown after results load", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { results: mockTracks } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "Daft" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() =>
				expect(screen.getByTestId("search-dropdown")).toBeInTheDocument(),
			);
		});

		it("displays track titles in search results", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { results: mockTracks } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "Daft" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() =>
				expect(screen.getAllByTestId("search-results").length).toBeGreaterThan(
					0,
				),
			);
		});

		it("shows 'No results' message when search returns empty", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { results: [] } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "xyzunknown" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() =>
				expect(screen.getByText(/No results for/i)).toBeInTheDocument(),
			);
		});

		it("clicking a search result calls playTrack and clears the query", async () => {
			const playTrack = jest.fn();
			usePlayer.mockReturnValue({ ...mockPlayerContext, playTrack });
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { results: mockTracks } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "Daft" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() => screen.getAllByTestId("search-results"));
			fireEvent.click(screen.getAllByTestId("search-results")[0]);

			expect(playTrack).toHaveBeenCalled();
			await waitFor(() =>
				expect(screen.queryByTestId("search-dropdown")).not.toBeInTheDocument(),
			);
		});

		it("renders 3-dot menu button for each search result", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { results: mockTracks } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "Daft" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() => screen.getByTestId("trending-menu-btn-1"));
			expect(screen.getByTestId("trending-menu-btn-1")).toBeInTheDocument();
		});

		it("opening search result menu shows TrackMenu", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { results: mockTracks } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "Daft" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() => screen.getByTestId("trending-menu-btn-1"));
			fireEvent.click(screen.getByTestId("trending-menu-btn-1"));

			// track-menu-1 can appear in both chart table and search dropdown — assert at least one
			expect(screen.getAllByTestId("track-menu-1").length).toBeGreaterThan(0);
		});

		it("URL-encodes the search query", async () => {
			await renderAndLoad();
			axios.get.mockClear();
			axios.get.mockResolvedValue({ data: { results: [] } });

			fireEvent.change(
				screen.getByPlaceholderText("Search songs, artists..."),
				{
					target: { value: "the weeknd" },
				},
			);

			await act(async () => jest.advanceTimersByTime(500));

			expect(axios.get).toHaveBeenCalledWith(
				expect.stringContaining("the%20weeknd"),
				expect.any(Object),
			);
		});
	});

	describe("User profile", () => {
		it("fetches user data on mount using token", async () => {
			await renderAndLoad();
			expect(axios.get).toHaveBeenCalledWith(
				"/api/user/user-123",
				expect.any(Object),
			);
		});

		it("displays username from API", async () => {
			await renderAndLoad();
			await waitFor(() =>
				expect(screen.getByText("testuser")).toBeInTheDocument(),
			);
		});

		it("shows avatar placeholder when no profileImage", async () => {
			await renderAndLoad();
			// No <img> with alt="Profile" when profileImage is empty
			expect(screen.queryByAltText("Profile")).not.toBeInTheDocument();
		});

		it("shows profile image when profileImage is set", async () => {
			axios.get.mockImplementation((url) => {
				if (url.includes("/api/user/"))
					return Promise.resolve({
						data: {
							...mockUser,
							profileImage: "https://example.com/avatar.jpg",
						},
					});
				return Promise.reject(new Error("Unknown"));
			});
			await renderAndLoad();
			await waitFor(() =>
				expect(screen.getByAltText("Profile")).toBeInTheDocument(),
			);
		});

		it("does not fetch user if no token present", async () => {
			localStorage.removeItem("token");
			axios.get.mockClear();
			setupAxios();
			await renderAndLoad();
			expect(axios.get).not.toHaveBeenCalledWith(
				expect.stringContaining("/api/user/"),
				expect.any(Object),
			);
		});
	});

	describe("Error and edge cases", () => {
		it("handles chart fetch failure gracefully (no crash)", async () => {
			axios.get.mockImplementation((url) => {
				if (url.includes("/api/user/"))
					return Promise.resolve({ data: mockUser });
				return Promise.reject(new Error("Network error"));
			});
			await renderAndLoad();
			expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		});

		it("shows empty sections when chart data returns empty arrays", async () => {
			axios.get.mockImplementation((url) => {
				if (url.includes("/api/user/"))
					return Promise.resolve({ data: mockUser });
				if (url.includes("/chart/0/tracks"))
					return Promise.resolve({ data: { data: [] } });
				if (url.includes("/chart/0/playlists"))
					return Promise.resolve({ data: { data: [] } });
				if (url.includes("/chart/0/albums"))
					return Promise.resolve({ data: { data: [] } });
				return Promise.reject(new Error("Unknown"));
			});
			await renderAndLoad();
			// Sections still render, just empty
			expect(screen.getByText("Trending Songs")).toBeInTheDocument();
		});

		it("formats duration correctly for tracks", async () => {
			await renderAndLoad();
			// 248s = 4:08
			expect(screen.getAllByText("4:08").length).toBeGreaterThan(0);
		});
	});
});
