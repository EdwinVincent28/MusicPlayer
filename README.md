Live Hosted Site - https://musicplayerfrontend.onrender.com

# 🎵 MusicPlayer

A full-stack music streaming web application that lets users discover music, build playlists, and manage their library — powered by the public Deezer API with a custom backend layer for user-specific features.

> 🎓 **University Project** — This was originally developed as a university project and was hosted in a private repository. This is a public mirror of that repo, preserving the full project history.

---

## ✨ Features

- 🔐 **Authentication** — Secure sign-up and login using JWT
- 🔍 **Search** — Search for any song or artist via the Deezer API
- ❤️ **Liked Songs** — Save your favorite tracks to your personal library
- 📋 **Playlists** — Create playlists and add songs to them
- 👤 **User Profiles** — Custom user accounts stored in MongoDB

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, shadcn/ui |
| Backend | Node.js (Express) |
| Database | MongoDB |
| Auth | JWT (JSON Web Tokens) |
| Music Data | [Deezer Public API](https://developers.deezer.com/api) + Custom API |
| Testing | Cypress (E2E), Vitest (unit & component) |

---

## 📁 Project Structure

```
MusicPlayer/
├── client/          # React + Vite frontend
└── server/          # Node.js backend
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (running locally or a MongoDB Atlas URI)

### 1. Clone the repository

```bash
git clone https://github.com/EdwinVincent28/MusicPlayer.git
cd MusicPlayer
```

### 2. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Run the application

**Start the backend server:**
```bash
cd server
node server.js
```

**Start the frontend dev server** (in a new terminal):
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173` (or whichever port Vite assigns).

---

## 🧪 Testing

### End-to-End Tests (Cypress)

```bash
cd client
npm run cypress:open
```

### Unit & Component Tests (Vitest)

```bash
# Run tests
npm run test

# Run with coverage report
npm run test:coverage
```

---

## 🌐 Deezer API Note

This app uses the [Deezer Public API](https://developers.deezer.com/api) to fetch song and artist data. Since the public Deezer API does not support user-specific features (liked songs, playlists, or account management), a custom REST API has been built on top of the Node.js backend to handle these features.

> ⚠️ **Network Notice:** Some private or corporate networks may block requests to the Deezer API. If songs or search results fail to load, try switching to a different network or using a VPN.

---

## 🔒 Authentication

Authentication is handled with **JSON Web Tokens (JWT)**. On sign-up/login, the server issues a token that is sent with each subsequent request to authenticate the user and protect private routes.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
