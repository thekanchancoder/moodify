import axios from "axios";

export const songApi = axios.create({
    baseURL: 'https://moodify-38d0.onrender.com',
    withCredentials: true
})


export const getAllSongs = async ({ mood }) => {
    const res = await songApi.get(`/api/song?mood=${mood}`)
    return res.data
}

export const getSongsByMood = async (moodOrObj) => {
    const mood = typeof moodOrObj === 'object' && moodOrObj !== null ? moodOrObj.mood : moodOrObj;
    const res = await songApi.get(`/api/song/mood?mood=${mood}`);
    return res.data;
};

export const searchSongsApi = async (query) => {
    const res = await songApi.get(`/api/song/search?q=${encodeURIComponent(query)}`);
    return res.data;
};       