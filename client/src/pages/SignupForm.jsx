import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SignupForm() {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [profileImage, setProfileImage] = useState(null);

	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			setProfileImage(e.target.files[0]);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const formData = new FormData();
		formData.append("username", username);
		formData.append("email", email);
		formData.append("password", password);

		if (profileImage) {
			formData.append("profileImage", profileImage);
		}

		try {
			const response = await axios.post(
				"http://localhost:4000/api/public/signup",
				formData,
			);

			console.log("Signup successful!", response.data);

			const { token } = response.data;
			localStorage.setItem("token", token);
			navigate("/home");
		} catch (err) {
			if (err.response && err.response.data && err.response.data.error) {
				setError(err.response.data.error);
			} else {
				setError("Network error. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleLoginClick = () => {
		navigate("/");
	};

	return (
		<Card className="w-full max-w-sm mx-auto mt-20 shadow-md bg-white">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold text-center">
					Create an account
				</CardTitle>
				<CardDescription className="text-center">
					Sign up to start listening to your favourite music
				</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					{error && (
						<div className="text-sm font-medium text-destructive text-center">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							type="text"
							placeholder="johndoe"
							required
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="test@gmail.com"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="profileImage">Profile Image</Label>
						<Input
							id="profileImage"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="cursor-pointer"
						/>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-3 mt-2">
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Creating account..." : "Sign Up"}
					</Button>

					<div className="relative w-full text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
						<span className="relative z-10 bg-background px-2 text-muted-foreground bg-white">
							Or
						</span>
					</div>

					<Button
						type="button"
						variant="ghost"
						className="w-full"
						onClick={handleLoginClick}
						disabled={isLoading}
					>
						Already have an account? Log in
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
