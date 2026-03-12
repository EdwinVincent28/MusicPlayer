import { formatFans } from "../utils/musicUtils.js";

describe("formatFans", () => {
	test("formats millions correctly", () => {
		expect(formatFans(4200000)).toBe("4.2M");
	});

	test("formats thousands correctly", () => {
		expect(formatFans(45000)).toBe("45.0K");
	});

	test("returns number if less than 1000", () => {
		expect(formatFans(500)).toBe("500");
	});

	test("formats exactly one million", () => {
		expect(formatFans(1000000)).toBe("1.0M");
	});

	test("formats exactly one thousand", () => {
		expect(formatFans(1000)).toBe("1.0K");
	});
});
