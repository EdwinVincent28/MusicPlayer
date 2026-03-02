import { Routes, Route } from "react-router-dom";
import "./App.css";
import Artist from "./pages/Artist";
import { LoginForm } from "./pages/LoginForm";
import { SignupForm } from "./pages/SignupForm";
import LandingPage from "./pages/LandingPage";

function App() {
	return (
		<Routes>
			<Route path="/" element={<LoginForm />} />
			<Route path="/signup" element={<SignupForm />} />
			<Route path="/artist" element={<Artist />} />
			<Route path="/home" element={<LandingPage />} />
		</Routes>
	);
}

export default App;
