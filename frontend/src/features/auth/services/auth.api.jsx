import axios from "axios";

const API=axios.create({
    baseURL:"http://localhost:3000/api/auth",
    withCredentials:true,
    timeout: 8000
})

export async function registerUser({username,email,password}){
    const response=await API.post("/register",{username,email,password})
    return response.data
}

export async function loginUser({username,password,email }){
    const response=await API.post("/login",{username,email, password})
    return response.data
}


export async function getMe(){
const res=await API.get("/get-me")
return res.data
}


export async function logoutUser(){
    const response=await API.get("/logout")
    return response.data
}
