import { Routes, Route } from "react-router-dom"
import './App.css'
import Artist from './pages/Artist'
import { LoginForm } from './pages/LoginForm'
import { SignupForm } from './pages/SignupForm'

function App() {
  return (
      <Routes>
        <Route path="/" element={<LoginForm/>} />
        <Route path="/signup" element={<SignupForm/>} />
        <Route path="/artist" element={<Artist/>} />
      </Routes>
  )
}

export default App;
