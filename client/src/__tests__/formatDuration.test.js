import { formatDuration } from "../utils/musicUtils";

describe("formatDuration", () => {
    test("formats 180 seconds as 3:00", () => {
        expect(formatDuration(180)).toBe("3:00");
    });

    test("formats 65 seconds as 1:05 with leading zero", () => {
        expect(formatDuration(65)).toBe("1:05");
    });

    test("formats 0 seconds as --:--", () => {
        expect(formatDuration(0)).toBe("--:--");
    });

    test("returns --:-- for null", () => {
        expect(formatDuration(null)).toBe("--:--");
    });

    test("returns --:-- for undefined", () => {
        expect(formatDuration(undefined)).toBe("--:--");
    });

    test("formats 60 seconds as 1:00", () => {
        expect(formatDuration(60)).toBe("1:00");
    });

    test("formats 3600 seconds as 60:00", () => {
        expect(formatDuration(3600)).toBe("60:00");
    });
});