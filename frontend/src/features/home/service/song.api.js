import axios from "axios";

export const songApi = axios.create({
    baseURL:'http://localhost:3000',
    withCredentials:true
})


export const getAllSongs = async({mood}) => {
    const res= await songApi .get(`/api/song?mood=${mood}`)
return res.data


}       