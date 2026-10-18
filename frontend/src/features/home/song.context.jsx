import { createContext, useState } from "react";

export const SongContext = createContext();

export const SongProvider = ({ children }) => {
  // Pure 10 songs ki array dynamic save karne ke liye
  const [playlist, setPlaylist] = useState([]);
  
  // Currently playing active song
  const [currentSong, setCurrentSong] = useState(null);
  
  // Current detected mood ('happy', 'sad', 'surprised')
  const [mood, setMood] = useState("");
  
  const [loading, setloading] = useState(false);

  return (
    <SongContext.Provider 
      value={{ 
        playlist, 
        setPlaylist, 
        currentSong, 
        setCurrentSong, 
        mood, 
        setMood, 
        loading, 
        setloading 
      }}
    >
      {children}
    </SongContext.Provider>
  );
};