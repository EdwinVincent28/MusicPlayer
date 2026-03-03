import { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(75);
    const audioRef = useRef(null); 

    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        const handleTimeUpdate = () => setProgress(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => setPlaying(false);

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
            audio.pause();
        };
    }, []);

    useEffect(() => {
        if (!currentTrack || !audioRef.current) return;
        audioRef.current.src = currentTrack.preview;
        audioRef.current.play();
        setPlaying(true);
    }, [currentTrack]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume / 100;
    }, [volume]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    const seek = (value) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = value;
        setProgress(value);
    };

    const playTrack = (track) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            setCurrentTrack(track);
        }
    };

    const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack, playing, progress,
            duration, volume,
            playTrack, togglePlay, seek,
            setVolume, formatTime,
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);