import { render, screen, fireEvent, act } from "@testing-library/react";
import { SignupForm } from "../SignupForm";
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

describe("SignupForm", () => {
	test("renders all fields", () => {
		render(<SignupForm />);

		expect(screen.getByLabelText("Username")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText("Profile Image")).toBeInTheDocument();
	});

	test("renders sign up and login buttons", () => {
		render(<SignupForm />);

		expect(screen.getByText("Sign Up")).toBeInTheDocument();
		expect(screen.getByText("Already have an account? Log in")).toBeInTheDocument();
	});

	test("updates fields on input", () => {
		render(<SignupForm />);

		fireEvent.change(screen.getByLabelText("Username"), {
			target: { value: "johndoe" },
		});
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "john@gmail.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "secret123" },
		});

		expect(screen.getByLabelText("Username").value).toBe("johndoe");
		expect(screen.getByLabelText("Email").value).toBe("john@gmail.com");
		expect(screen.getByLabelText("Password").value).toBe("secret123");
	});

	test("successful signup stores token and navigates to home", async () => {
		axios.post.mockResolvedValue({ data: { token: "fake-token" } });

		render(<SignupForm />);

		fireEvent.change(screen.getByLabelText("Username"), {
			target: { value: "johndoe" },
		});
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "john@gmail.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "secret123" },
		});

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign Up").closest("form"));
		});

		expect(localStorage.getItem("token")).toBe("fake-token");
		expect(mockNavigate).toHaveBeenCalledWith("/home");
	});

	test("submits form with FormData including profile image", async () => {
		axios.post.mockResolvedValue({ data: { token: "fake-token" } });

		render(<SignupForm />);

		const file = new File(["img"], "photo.png", { type: "image/png" });
		fireEvent.change(screen.getByLabelText("Profile Image"), {
			target: { files: [file] },
		});

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign Up").closest("form"));
		});

		const formData = axios.post.mock.calls[0][1];
		expect(formData).toBeInstanceOf(FormData);
		expect(formData.get("profileImage")).toBeTruthy();
	});

	test("shows server error on failed signup", async () => {
		axios.post.mockRejectedValue({
			response: { data: { error: "Email already exists" } },
		});

		render(<SignupForm />);

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign Up").closest("form"));
		});

		expect(screen.getByText("Email already exists")).toBeInTheDocument();
	});

	test("shows network error when no response from server", async () => {
		axios.post.mockRejectedValue(new Error("Network Error"));

		render(<SignupForm />);

		await act(async () => {
			fireEvent.submit(screen.getByText("Sign Up").closest("form"));
		});

		expect(screen.getByText("Network error. Please try again.")).toBeInTheDocument();
	});

	test("navigates to login on log in button click", () => {
		render(<SignupForm />);

		fireEvent.click(screen.getByText("Already have an account? Log in"));

		expect(mockNavigate).toHaveBeenCalledWith("/");
	});
});