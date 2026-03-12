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
import ArtistsPage from "../ArtistsPage";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

jest.mock("@/components/Sidebar.jsx", () => () => (
	<div data-testid="sidebar" />
));
jest.mock("@/components/MusicPlayer.jsx", () => () => (
	<div data-testid="music-player" />
));

beforeAll(() => {
	jest.spyOn(console, "error").mockImplementation(() => {});
	jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
	console.error.mockRestore();
	console.log.mockRestore();
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockArtist = (overrides = {}) => ({
	id: 27,
	name: "Daft Punk",
	picture_medium: "https://example.com/daftpunk_med.jpg",
	picture_big: "https://example.com/daftpunk_big.jpg",
	picture_xl: "https://example.com/daftpunk_xl.jpg",
	nb_fan: 4_200_000,
	...overrides,
});

const mockFeaturedArtists = [
	mockArtist({ id: 27, name: "Daft Punk", nb_fan: 4_200_000 }),
	mockArtist({ id: 13, name: "Eminem", nb_fan: 10_000_000 }),
	mockArtist({ id: 384236, name: "The Weeknd", nb_fan: 8_500_000 }),
];

const mockSearchResults = [
	mockArtist({ id: 999, name: "David Bowie", nb_fan: 3_000_000 }),
	mockArtist({ id: 888, name: "David Guetta", nb_fan: 5_000_000 }),
];

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers();
	axios.get.mockResolvedValue({ data: mockFeaturedArtists[0] });
});

afterEach(() => {
	jest.runOnlyPendingTimers();
	jest.useRealTimers();
});

async function renderAndLoad() {
	axios.get.mockImplementation((url) => {
		if (url.includes("/artist/27"))
			return Promise.resolve({ data: mockFeaturedArtists[0] });
		if (url.includes("/artist/13"))
			return Promise.resolve({ data: mockFeaturedArtists[1] });
		return Promise.resolve({ data: mockFeaturedArtists[2] });
	});
	await act(async () => render(<ArtistsPage />));
	await act(async () => {});
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ArtistsPage", () => {
	// ── Layout ───────────────────────────────────────────────────────────────────

	describe("Layout", () => {
		it("renders sidebar", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		});

		it("renders music player", async () => {
			await renderAndLoad();
			expect(screen.getByTestId("music-player")).toBeInTheDocument();
		});

		it("renders the Artists heading", async () => {
			await renderAndLoad();
			expect(screen.getByText("Artists")).toBeInTheDocument();
		});

		it("renders the search input", async () => {
			await renderAndLoad();
			expect(
				screen.getByPlaceholderText("Search artists..."),
			).toBeInTheDocument();
		});

		it("shows 'Featured & popular artists' subtitle by default", async () => {
			await renderAndLoad();
			expect(
				screen.getByText("Featured & popular artists"),
			).toBeInTheDocument();
		});

		it("shows 'Featured Artists' section label by default", async () => {
			await renderAndLoad();
			expect(screen.getByText("Featured Artists")).toBeInTheDocument();
		});
	});

	// ── Featured artists ──────────────────────────────────────────────────────────

	describe("Featured artists", () => {
		it("shows skeleton loaders while fetching", () => {
			axios.get.mockImplementation(() => new Promise(() => {}));
			render(<ArtistsPage />);
			expect(screen.queryByText("Daft Punk")).not.toBeInTheDocument();
		});

		it("renders artist card after loading", async () => {
			await renderAndLoad();
			expect(screen.getByText("Daft Punk")).toBeInTheDocument();
		});

		it("renders artist name inside card", async () => {
			await renderAndLoad();
			expect(screen.getByText("Daft Punk")).toBeInTheDocument();
		});

		it("renders fan count formatted in millions", async () => {
			await renderAndLoad();
			expect(screen.getByText("4.2M fans")).toBeInTheDocument();
		});

		it("renders multiple artist cards", async () => {
			await renderAndLoad();
			// Eminem maps to id 13, The Weeknd is the fallback for all other IDs
			// so multiple "The Weeknd" cards appear — use getAllByText for the fallback
			expect(screen.getByText("Eminem")).toBeInTheDocument();
			expect(screen.getAllByText("The Weeknd").length).toBeGreaterThan(0);
		});

		it("filters out failed artist fetches gracefully", async () => {
			axios.get.mockImplementation((url) => {
				if (url.includes("/artist/27"))
					return Promise.resolve({ data: mockFeaturedArtists[0] });
				return Promise.reject(new Error("Not found"));
			});
			await act(async () => render(<ArtistsPage />));
			await act(async () => {});
			expect(screen.getByText("Daft Punk")).toBeInTheDocument();
			expect(screen.queryByText("Eminem")).not.toBeInTheDocument();
		});

		it("renders 'Artist' fallback when nb_fan is missing", async () => {
			axios.get.mockResolvedValue({ data: mockArtist({ nb_fan: null }) });
			await act(async () => render(<ArtistsPage />));
			await act(async () => {});
			// All 15 featured requests return same artist — multiple "Artist" labels expected
			expect(screen.getAllByText("Artist").length).toBeGreaterThan(0);
		});
	});

	// ── Search ────────────────────────────────────────────────────────────────────

	describe("Search", () => {
		it("does not search immediately on input (debounced)", async () => {
			await renderAndLoad();
			axios.get.mockClear();

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});

			expect(axios.get).not.toHaveBeenCalled();
		});

		it("searches after 500ms debounce", async () => {
			await renderAndLoad();
			axios.get.mockClear();
			axios.get.mockResolvedValue({ data: { data: mockSearchResults } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});

			await act(async () => jest.advanceTimersByTime(500));

			expect(axios.get).toHaveBeenCalledWith(
				expect.stringContaining("David"),
				expect.any(Object),
			);
		});

		it("renders search result artist names", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: mockSearchResults } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() => {
				expect(screen.getByText("David Bowie")).toBeInTheDocument();
				expect(screen.getByText("David Guetta")).toBeInTheDocument();
			});
		});

		it("shows result count in subtitle", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: mockSearchResults } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() =>
				expect(screen.getByText(`2 results for "David"`)).toBeInTheDocument(),
			);
		});

		it("shows 'Search Results' section label when searching", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: mockSearchResults } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() =>
				expect(screen.getByText("Search Results")).toBeInTheDocument(),
			);
		});

		it("shows 'No artists found' when search returns empty", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: [] } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "xyznotanartist" },
			});

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() =>
				expect(screen.getByText("No artists found")).toBeInTheDocument(),
			);
		});

		it("shows 'Try a different name' hint in empty state", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: [] } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "xyznotanartist" },
			});

			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			await waitFor(() =>
				expect(screen.getByText("Try a different name")).toBeInTheDocument(),
			);
		});

		it("URL-encodes the search query", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: [] } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "the weeknd" },
			});

			await act(async () => jest.advanceTimersByTime(500));

			expect(axios.get).toHaveBeenCalledWith(
				expect.stringContaining("the%20weeknd"),
				expect.any(Object),
			);
		});

		it("does not search when query is only whitespace", async () => {
			await renderAndLoad();
			axios.get.mockClear();

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "   " },
			});

			await act(async () => jest.advanceTimersByTime(500));

			expect(axios.get).not.toHaveBeenCalled();
		});
	});

	// ── Clear search ──────────────────────────────────────────────────────────────

	describe("Clear search", () => {
		it("shows clear button when query is non-empty", async () => {
			await renderAndLoad();

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});

			expect(screen.getByTestId("clear-search")).toBeInTheDocument();
		});

		it("does not show clear button when query is empty", async () => {
			await renderAndLoad();
			expect(screen.queryByTestId("clear-search")).not.toBeInTheDocument();
		});

		it("clears the input on clear button click", async () => {
			await renderAndLoad();

			const input = screen.getByPlaceholderText("Search artists...");
			fireEvent.change(input, { target: { value: "David" } });
			fireEvent.click(screen.getByTestId("clear-search"));

			expect(input.value).toBe("");
		});

		it("hides clear button after clearing", async () => {
			await renderAndLoad();

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});
			fireEvent.click(screen.getByTestId("clear-search"));

			expect(screen.queryByTestId("clear-search")).not.toBeInTheDocument();
		});

		it("restores 'Featured Artists' label after clearing search", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: mockSearchResults } });

			const input = screen.getByPlaceholderText("Search artists...");
			fireEvent.change(input, { target: { value: "David" } });
			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			fireEvent.click(screen.getByTestId("clear-search"));

			expect(screen.getByText("Featured Artists")).toBeInTheDocument();
		});

		it("resets subtitle to 'Featured & popular artists' after clear", async () => {
			await renderAndLoad();

			const input = screen.getByPlaceholderText("Search artists...");
			fireEvent.change(input, { target: { value: "David" } });
			fireEvent.click(screen.getByTestId("clear-search"));

			expect(
				screen.getByText("Featured & popular artists"),
			).toBeInTheDocument();
		});
	});

	// ── Navigation ────────────────────────────────────────────────────────────────

	describe("Navigation", () => {
		it("navigates to artist page when card is clicked", async () => {
			await renderAndLoad();

			fireEvent.click(screen.getByText("Daft Punk"));

			expect(mockNavigate).toHaveBeenCalledWith(
				"/artist/27",
				expect.objectContaining({ state: { artist: mockFeaturedArtists[0] } }),
			);
		});

		it("passes full artist object in navigation state", async () => {
			await renderAndLoad();

			fireEvent.click(screen.getByText("Daft Punk"));

			const [, options] = mockNavigate.mock.calls[0];
			expect(options.state.artist).toMatchObject({ id: 27, name: "Daft Punk" });
		});

		it("navigates with correct artist id for a different card", async () => {
			await renderAndLoad();

			fireEvent.click(screen.getByText("Eminem"));

			expect(mockNavigate).toHaveBeenCalledWith(
				"/artist/13",
				expect.any(Object),
			);
		});

		it("navigates to correct search result artist on click", async () => {
			await renderAndLoad();
			axios.get.mockResolvedValue({ data: { data: mockSearchResults } });

			fireEvent.change(screen.getByPlaceholderText("Search artists..."), {
				target: { value: "David" },
			});
			await act(async () => jest.advanceTimersByTime(500));
			await act(async () => {});

			// data-testid is not forwarded by ArtistCard's root div (fix: add {...rest} spread).
			// Use artist name text to locate the card until the component is updated.
			await waitFor(() => screen.getByText("David Bowie"));
			fireEvent.click(screen.getByText("David Bowie"));

			expect(mockNavigate).toHaveBeenCalledWith(
				"/artist/999",
				expect.any(Object),
			);
		});
	});
});
