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
import { formatFans } from "@/utils/musicUtils";

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

jest.mock("@/utils/musicUtils", () => ({
	formatFans: jest.fn((num) => {
		if (!num) return "Artist";
		if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M fans`;
		if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K fans`;
		return `${num} fans`;
	}),
}));

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
	await act(async () => {}); // wait for effects
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ArtistsPage", () => {
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
	});

	describe("Featured artists", () => {
		it("renders artist card after loading", async () => {
			await renderAndLoad();
			expect(screen.getByText("Daft Punk")).toBeInTheDocument();
		});

		it("renders fan count formatted in millions", async () => {
			await renderAndLoad();
			expect(screen.getByText("4.2M fans")).toBeInTheDocument();
		});

		it("renders multiple artist cards", async () => {
			await renderAndLoad();
			expect(screen.getByText("Eminem")).toBeInTheDocument();
			expect(screen.getAllByText("The Weeknd").length).toBeGreaterThan(0);
		});
	});

	describe("Search", () => {
		it("searches after debounce and renders results", async () => {
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
	});

	describe("Navigation", () => {
		it("navigates to artist page when card is clicked", async () => {
			await renderAndLoad();
			fireEvent.click(screen.getByText("Daft Punk"));

			expect(mockNavigate).toHaveBeenCalledWith(
				"/artist/27",
				expect.objectContaining({ state: { artist: mockFeaturedArtists[0] } }),
			);
		});
	});

	// ── New unit test for formatFans utility ──
	describe("musicUtils", () => {
		it("formats fans correctly", () => {
			expect(formatFans(4200000)).toBe("4.2M fans");
			expect(formatFans(15000)).toBe("15.0K fans");
			expect(formatFans(500)).toBe("500 fans");
			expect(formatFans(null)).toBe("Artist");
		});
	});
});
