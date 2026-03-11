import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MusicPlayer from "../MusicPlayer";
import axios from "axios";
import { usePlayer } from "../../context/PlayerContext";

jest.mock("axios");
jest.mock("../../context/PlayerContext");

// Mock Slider
jest.mock("@/components/ui/slider", () => ({
	Slider: ({ value = [0], onValueChange, "data-testid": testId }) => (
		<input
			type="range"
			data-testid={testId}
			value={value[0]}
			onChange={(e) => onValueChange([Number(e.target.value)])}
		/>
	),
}));

const mockTogglePlay = jest.fn();
const mockSeekTo = jest.fn();
const mockSetVolume = jest.fn();
const mockSkipNext = jest.fn();
const mockSkipPrev = jest.fn();

const mockTrack = {
	id: "123",
	title: "Test Song",
	artist: "Test Artist",
	preview: "preview.mp3",
	duration: 120,
	cover: "cover.jpg",
};

const setupPlayer = (overrides = {}) => {
	usePlayer.mockReturnValue({
		currentTrack: mockTrack,
		playing: false,
		togglePlay: mockTogglePlay,
		progress: 10,
		seekTo: mockSeekTo,
		volume: 0.5,
		setVolume: mockSetVolume,
		skipNext: mockSkipNext,
		skipPrev: mockSkipPrev,
		hasPrev: true,
		hasNext: true,
		...overrides,
	});
};

beforeEach(() => {
	jest.clearAllMocks();
	localStorage.setItem("token", "fake-token");
});

describe("MusicPlayer", () => {
	test("renders player with track info", () => {
		setupPlayer();
		render(<MusicPlayer />);

		expect(screen.getByTestId("music-player")).toBeInTheDocument();
		expect(screen.getByText("Test Song")).toBeInTheDocument();
		expect(screen.getByText("Test Artist")).toBeInTheDocument();
	});

	test("toggles play button", () => {
		setupPlayer();
		render(<MusicPlayer />);

		fireEvent.click(screen.getByTestId("play-btn"));

		expect(mockTogglePlay).toHaveBeenCalled();
	});

	test("calls skip next", () => {
		setupPlayer();
		render(<MusicPlayer />);

		fireEvent.click(screen.getByTestId("skip-next"));

		expect(mockSkipNext).toHaveBeenCalled();
	});

	test("calls skip previous", () => {
		setupPlayer();
		render(<MusicPlayer />);

		fireEvent.click(screen.getByTestId("skip-prev"));

		expect(mockSkipPrev).toHaveBeenCalled();
	});

	test("changes progress slider", () => {
		setupPlayer();
		render(<MusicPlayer />);

		fireEvent.change(screen.getByTestId("progress-slider"), {
			target: { value: 50 },
		});

		expect(mockSeekTo).toHaveBeenCalledWith(50);
	});

	test("changes volume slider", () => {
		setupPlayer();
		render(<MusicPlayer />);

		fireEvent.change(screen.getByTestId("volume-slider"), {
			target: { value: 80 },
		});

		expect(mockSetVolume).toHaveBeenCalledWith(0.8);
	});

	test("likes a track", async () => {
		setupPlayer();

		axios.get.mockResolvedValue({ data: { isLiked: false } });
		axios.put.mockResolvedValue({});

		render(<MusicPlayer />);

		fireEvent.click(screen.getByTestId("like-btn"));

		await waitFor(() => {
			expect(axios.put).toHaveBeenCalled();
		});
	});

	test("fetches liked status on mount", async () => {
		setupPlayer();

		axios.get.mockResolvedValue({
			data: { isLiked: true },
		});

		render(<MusicPlayer />);

		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledWith(
				"/api/user/like/123",
				expect.any(Object),
			);
		});
	});

	test("shows no preview message when preview missing", () => {
		setupPlayer({
			currentTrack: { ...mockTrack, preview: null },
		});

		render(<MusicPlayer />);

		expect(screen.getByText(/No preview available/i)).toBeInTheDocument();
	});

	test("does not render player if no track", () => {
		usePlayer.mockReturnValue({
			currentTrack: null,
		});

		const { container } = render(<MusicPlayer />);

		expect(container.firstChild).toBeNull();
	});
});
