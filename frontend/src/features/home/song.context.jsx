import { createContext, useState } from "react";


export const SongContext = createContext();


export const SongProvider = ({ children }) => {

    const [song, setSong] = useState({

        "url": 'https://ik.imagekit.io/vewy0hjmjb/moodify/cohort/Senorita_-_PagalNew_qgvjkm-TP.mp3',
        "posterUrl": 'https://ik.imagekit.io/vewy0hjmjb/moodify/cohort/posters/Senorita_-_PagalNew_W-VWPSmaA.jpeg',
        "title": 'Senorita - PagalNew',
        "mood": 'happy',

    })

    const [loading, setloading] = useState(false)



    return (
        <SongContext.Provider value={{ loading, setloading, song, setSong }}>
            {children}
        </SongContext.Provider>
    )
}
