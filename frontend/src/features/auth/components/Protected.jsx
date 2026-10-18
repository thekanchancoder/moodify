import React from 'react'
import { useNavigate } from "react-router"
import useAuth from "../hooks/useAuth"

const Protected = ({ children }) => {
    const { user, loading } = useAuth()

    const Navigate = useNavigate()


    if (loading) {
        return <h1>loading...</h1>
    }


    if (!user && !loading) {
        return <Navigate to="/login" />
    }



    return children
}

export default Protected