import { getSongsByMood } from "../service/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {
  const context = useContext(SongContext);

  if (!context) {
    throw new Error("useSong must be used within a SongProvider");
  }

  const { 
    loading, 
    setloading, 
    playlist, 
    setPlaylist, 
    currentSong, 
    setCurrentSong, 
    mood, 
    setMood 
  } = context;

  async function handleGetSong({ mood }) {
    if (!mood) return;

    setloading(true);
    setMood(mood);

    try {
      // YouTube backend API hit karein: /api/song/mood?mood=happy
      const data = await getSongsByMood(mood);

      if (data?.success && data?.playlist?.length > 0) {
        setPlaylist(data.playlist); // Pure 10 songs ki array save karein
        setCurrentSong(data.playlist[0]); // Pehla song auto-play ke liye set karein
      }
    } catch (error) {
      console.error("Error loading mood songs:", error);
    } finally {
      setloading(false);
    }
  }

  return {
    handleGetSong,
    loading,
    playlist,
    currentSong,
    setCurrentSong,
    mood
  };
};