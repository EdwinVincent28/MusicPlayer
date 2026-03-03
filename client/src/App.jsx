import { Routes, Route } from "react-router-dom";
import "./App.css";
import Artist from "./pages/Artist";
import { LoginForm } from "./pages/LoginForm";
import { SignupForm } from "./pages/SignupForm";
import LandingPage from "./pages/LandingPage";
import LikedSongs from "./pages/LikedSongs";

function App() {
	return (
		<Routes>
			<Route path="/" element={<LoginForm />} />
			<Route path="/signup" element={<SignupForm />} />
			<Route path="/artist" element={<Artist />} />
			<Route path="/home" element={<LandingPage />} />
			<Route path="/like" element={<LikedSongs />} />
		</Routes>
	);
}

export default App;
