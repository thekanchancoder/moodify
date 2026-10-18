
import React, { useState } from 'react'
import "../styles/Login.scss"
import { Link } from 'react-router'
import FormGroup from '../components/FormGroup'
import useAuth from '../hooks/useAuth'
import {useNavigate} from "react-router"
const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
 
 const {login,loading}=useAuth()
const navigate=useNavigate()
 
 async function handleLogin(e) {
  e.preventDefault()
try {
    await login({email,password,username:email})
     navigate("/")
} catch (error) {
   alert(error.response?.data?.message || "Invalid credentials");
} 



}

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <FormGroup
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
            label="Username or Email"
            placeholder="Enter your username or email"
            type="text"
          />

          <FormGroup
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            label="Password"
            placeholder="Enter your password"
            type="password"
          />

          <button className="button" type="submit">
            Login
          </button>

          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default Login
