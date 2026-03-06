import { Routes, Route } from "react-router-dom";
import "./App.css";
import ArtistPage from "./pages/ArtistPage";
import ArtistsPage from "./pages/ArtistsPage";
import { LoginForm } from "./pages/LoginForm";
import { SignupForm } from "./pages/SignupForm";
import LandingPage from "./pages/LandingPage";
import { PlayerProvider } from "./context/PlayerContext.jsx";

function App() {
	return (
		<PlayerProvider>
			<Routes>
				<Route path="/" element={<LoginForm />} />
				<Route path="/signup" element={<SignupForm />} />
				<Route path="/artist/:id" element={<ArtistPage />} />
				<Route path="/artists" element={<ArtistsPage />} />
				<Route path="/home" element={<LandingPage />} />
			</Routes>
		</PlayerProvider>
	);
}

export default App;
