import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../Sidebar";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
	MemoryRouter: ({ children }) => children,
	useNavigate: () => mockNavigate,
	useLocation: () => ({ pathname: "/home" }),
}));

describe("Sidebar Component", () => {
	beforeEach(() => {
		mockNavigate.mockClear();
		render(<Sidebar />);
	});

	test("renders logo and brand name", () => {
		expect(screen.getByText("Melodix")).toBeInTheDocument();
	});

	test("renders all nav items", () => {
		expect(screen.getByTestId("nav-home")).toBeInTheDocument();
		expect(screen.getByTestId("nav-liked-songs")).toBeInTheDocument();
		expect(screen.getByTestId("nav-playlists")).toBeInTheDocument();
		expect(screen.getByTestId("nav-artists")).toBeInTheDocument();
		expect(screen.getByTestId("nav-logout")).toBeInTheDocument();
	});

	test("applies active styles to current route (/home)", () => {
		expect(screen.getByTestId("nav-home").className).toContain("text-violet-300");
	});

	test("applies inactive styles to non-active routes", () => {
		expect(screen.getByTestId("nav-liked-songs").className).toContain("text-zinc-400");
	});

	test("navigates to liked songs on click", () => {
		fireEvent.click(screen.getByTestId("nav-liked-songs"));
		expect(mockNavigate).toHaveBeenCalledWith("/like");
	});

	test("navigates to playlists on click", () => {
		fireEvent.click(screen.getByTestId("nav-playlists"));
		expect(mockNavigate).toHaveBeenCalledWith("/playlist");
	});

	test("navigates to artists on click", () => {
		fireEvent.click(screen.getByTestId("nav-artists"));
		expect(mockNavigate).toHaveBeenCalledWith("/artists");
	});

	test("navigates to logout on click", () => {
		fireEvent.click(screen.getByTestId("nav-logout"));
		expect(mockNavigate).toHaveBeenCalledWith("/");
	});
});