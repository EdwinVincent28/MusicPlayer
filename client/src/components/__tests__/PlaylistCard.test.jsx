import { render, screen } from "@testing-library/react";
import PlaylistCard from "../PlaylistCard";

describe("PlaylistCard Component", () => {
	const mockProps = {
		title: "Chill Beats",
		image: "test-image.jpg",
		artist: "LoFi Artist",
		duration: "2h 15m",
	};

	test("renders playlist title", () => {
		render(<PlaylistCard {...mockProps} />);

		expect(screen.getByText("Chill Beats")).toBeInTheDocument();
	});

	test("renders artist name when provided", () => {
		render(<PlaylistCard {...mockProps} />);

		expect(screen.getByText("LoFi Artist")).toBeInTheDocument();
	});

	test("renders duration when provided", () => {
		render(<PlaylistCard {...mockProps} />);

		expect(screen.getByText("2h 15m")).toBeInTheDocument();
	});

	test("renders playlist image", () => {
		render(<PlaylistCard {...mockProps} />);

		const image = screen.getByRole("img");
		expect(image).toHaveAttribute("src", "test-image.jpg");
		expect(image).toHaveAttribute("alt", "Chill Beats");
	});

	test("renders play button", () => {
		render(<PlaylistCard {...mockProps} />);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
	});
});
