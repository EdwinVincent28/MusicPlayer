import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		try {
			const response = await axios.post(
				"/api/public/login",
				{
					email,
					password,
				},
			);

			console.log(response.data);

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

	const handleSignUpClick = () => {
		navigate("/signup");
	};

	return (
		<Card className="w-full max-w-sm mx-auto mt-20 shadow-md bg-white">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
				<CardDescription className="text-center">
					Enter your email and password to listen to your favourite music
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
				</CardContent>

				<CardFooter className="flex flex-col gap-3 mt-2">
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Signing in..." : "Sign In"}
					</Button>

					<div className="relative w-full text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
						<span className="relative z-10 bg-background px-2 text-muted-foreground bg-white">
							Or
						</span>
					</div>

					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={handleSignUpClick}
						disabled={isLoading}
					>
						Create an account
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
