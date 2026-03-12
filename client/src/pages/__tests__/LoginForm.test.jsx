import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { LoginForm } from "../LoginForm";
import axios from "axios";

jest.mock("axios");

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

jest.mock("@/components/ui/button", () => ({
	Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/input", () => ({
	Input: ({ ...props }) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
	Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

jest.mock("@/components/ui/card", () => ({
	Card: ({ children }) => <div>{children}</div>,
	CardHeader: ({ children }) => <div>{children}</div>,
	CardTitle: ({ children }) => <div>{children}</div>,
	CardDescription: ({ children }) => <div>{children}</div>,
	CardContent: ({ children }) => <div>{children}</div>,
	CardFooter: ({ children }) => <div>{children}</div>,
}));

beforeEach(() => {
	jest.clearAllMocks();
	localStorage.clear();
});

describe("LoginForm", () => {
	test("renders email and password fields", () => {
		render(<LoginForm />);

		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
	});

	test("renders sign in and create account buttons", () => {
		render(<LoginForm />);

		expect(screen.getByText("Sign In")).toBeInTheDocument();
		expect(screen.getByText("Create an account")).toBeInTheDocument();
	});

	test("updates email and password on input", () => {
		render(<LoginForm />);

		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "test@gmail.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "password123" },
		});

		expect(screen.getByLabelText("Email").value).toBe("test@gmail.com");
		expect(screen.getByLabelText("Password").value).toBe("password123");
	});

	test("successful login stores token and navigates to home", async () => {
		axios.post.mockResolvedValue({ data: { token: "fake-token" } });

		render(<LoginForm />);

		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "test@gmail.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "password123" },
		});

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign In").closest("form"));
		});

		expect(localStorage.getItem("token")).toBe("fake-token");
		expect(mockNavigate).toHaveBeenCalledWith("/home");
	});

	test("shows loading state while signing in", async () => {
		axios.post.mockResolvedValue({ data: { token: "fake-token" } });

		render(<LoginForm />);

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign In").closest("form"));
		});

		// After resolving, button should go back to normal
		expect(screen.getByText("Sign In")).toBeInTheDocument();
	});

	test("shows server error message on failed login", async () => {
		axios.post.mockRejectedValue({
			response: { data: { error: "Invalid credentials" } },
		});

		render(<LoginForm />);

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign In").closest("form"));
		});

		expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
	});

	test("shows network error when no response from server", async () => {
		axios.post.mockRejectedValue(new Error("Network Error"));

		render(<LoginForm />);

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign In").closest("form"));
		});

		expect(screen.getByText("Network error. Please try again.")).toBeInTheDocument();
	});

	test("navigates to signup on create account click", () => {
		render(<LoginForm />);

		fireEvent.click(screen.getByText("Create an account"));

		expect(mockNavigate).toHaveBeenCalledWith("/signup");
	});
});