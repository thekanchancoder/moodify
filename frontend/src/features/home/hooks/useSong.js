import { getAllSongs } from "../service/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {

    const context = useContext(SongContext)
    const { loading, setloading, song, setSong } = context

    async function loadSong(mood) {
        setloading(true)
        const songs = await getAllSongs({ mood })

        setSong(data.song)
        setloading(false)
    }

    return { loadSong, loading, song }
}
