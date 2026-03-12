import { songCount } from "../utils/musicUtils";

describe("songCount", () => {
    test("returns 0 for empty object", () => {
        expect(songCount({ playlistSongs: {} })).toBe(0);
    });

    test("returns correct count for object with songs", () => {
        expect(songCount({ playlistSongs: { a: 1, b: 2, c: 3 } })).toBe(3);
    });

    test("returns 0 when playlistSongs is missing", () => {
        expect(songCount({})).toBe(0);
    });

    test("returns correct count for Map", () => {
        const map = new Map([["a", 1], ["b", 2]]);
        expect(songCount({ playlistSongs: map })).toBe(2);
    });

    test("returns 1 for single song", () => {
        expect(songCount({ playlistSongs: { a: 1 } })).toBe(1);
    });
});