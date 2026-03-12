import { render, screen, fireEvent, act } from "@testing-library/react";
import { PlayerProvider, usePlayer } from "../context/PlayerContext";

// Mock Audio
let mockAudio;

beforeEach(() => {
    mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        src: "",
        currentTime: 0,
        duration: 100,
        volume: 1,
    };
    jest.spyOn(global, "Audio").mockImplementation(() => mockAudio);
});

afterEach(() => {
    jest.restoreAllMocks();
});

// Helper component to expose context values for testing
function TestPlayer({ onRender }) {
    const player = usePlayer();
    onRender(player);
    return null;
}

function renderPlayer(onRender) {
    render(
        <PlayerProvider>
            <TestPlayer onRender={onRender} />
        </PlayerProvider>
    );
}

const mockTrack1 = { id: "1", title: "Song One", preview: "prev1.mp3" };
const mockTrack2 = { id: "2", title: "Song Two", preview: "prev2.mp3" };
const mockTrackNoPreview = { id: "3", title: "No Preview", preview: null };

describe("PlayerContext", () => {
    test("initial state is correct", () => {
        let player;
        renderPlayer((p) => { player = p; });

        expect(player.currentTrack).toBeNull();
        expect(player.playing).toBe(false);
        expect(player.progress).toBe(0);
        expect(player.volume).toBe(0.75);
        expect(player.queue).toEqual([]);
        expect(player.hasPrev).toBe(false);
        expect(player.hasNext).toBe(false);
    });

    test("playTrack sets current track and plays", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playTrack(mockTrack1);
        });

        expect(player.currentTrack).toEqual(mockTrack1);
        expect(mockAudio.play).toHaveBeenCalled();
    });

    test("playTrack with no preview does not call play", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playTrack(mockTrackNoPreview);
        });

        expect(mockAudio.play).not.toHaveBeenCalled();
        expect(player.playing).toBe(false);
    });

    test("playQueue sets queue and plays from start index", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playQueue([mockTrack1, mockTrack2], 0);
        });

        expect(player.currentTrack).toEqual(mockTrack1);
        expect(player.queue).toHaveLength(2);
        expect(mockAudio.play).toHaveBeenCalled();
    });

    test("playQueue does nothing when empty array passed", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playQueue([]);
        });

        expect(player.currentTrack).toBeNull();
        expect(mockAudio.play).not.toHaveBeenCalled();
    });

    test("togglePlay pauses when playing", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playTrack(mockTrack1);
        });
        await act(async () => {
            player.togglePlay();
        });

        expect(mockAudio.pause).toHaveBeenCalled();
        expect(player.playing).toBe(false);
    });

    test("togglePlay resumes when paused and src exists", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playTrack(mockTrack1);
        });
        await act(async () => {
            player.togglePlay(); // pause
        });

        mockAudio.src = "prev1.mp3";
        mockAudio.play.mockClear();

        await act(async () => {
            player.togglePlay(); // resume
        });

        expect(mockAudio.play).toHaveBeenCalled();
    });

    test("skipNext moves to next track in queue", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playQueue([mockTrack1, mockTrack2], 0);
        });
        await act(async () => {
            player.skipNext();
        });

        expect(player.currentTrack).toEqual(mockTrack2);
    });

    test("skipPrev restarts track if more than 3s in", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playQueue([mockTrack1, mockTrack2], 1);
        });

        mockAudio.currentTime = 10;

        await act(async () => {
            player.skipPrev();
        });

        expect(mockAudio.currentTime).toBe(0);
    });

    test("skipPrev goes to previous track if under 3s in", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playQueue([mockTrack1, mockTrack2], 1);
        });

        mockAudio.currentTime = 1;

        await act(async () => {
            player.skipPrev();
        });

        expect(player.currentTrack).toEqual(mockTrack1);
    });

    test("seekTo updates progress", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playTrack(mockTrack1);
        });
        await act(async () => {
            player.seekTo(50);
        });

        expect(player.progress).toBe(50);
        expect(mockAudio.currentTime).toBe(50);
    });

    test("setVolume updates volume", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.setVolume(0.5);
        });

        expect(player.volume).toBe(0.5);
    });

    test("hasPrev is false at start of queue", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playQueue([mockTrack1, mockTrack2], 0);
        });

        expect(player.hasPrev).toBe(false);
    });

    test("hasNext is false at end of queue", async () => {
        let player;
        renderPlayer((p) => { player = p; });

        await act(async () => {
            player.playQueue([mockTrack1, mockTrack2], 1);
        });

        expect(player.hasNext).toBe(false);
    });

    test("usePlayer throws error outside provider", () => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        expect(() => render(<TestPlayer onRender={() => {}} />)).toThrow(
            "usePlayer must be used inside <PlayerProvider>"
        );

        console.error.mockRestore();
    });
});