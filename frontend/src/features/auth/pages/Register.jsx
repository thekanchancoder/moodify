import React, { useState } from 'react'
import FormGroup from '../components/FormGroup'
import { Link } from 'react-router'
import "../styles/Login.scss"
import useAuth from '../hooks/useAuth'
import {useNavigate} from "react-router"


const Register = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

const {register,loading}=useAuth()
const navigate=useNavigate()

async function handleRegister(e) {
  e.preventDefault()
 try {
    await register({email,password,username})
     navigate("/")
} catch (error) {
alert(error.response?.data?.message || "Registration failed");
} 

}
  return (

    <main className="login-page">
      <div className="login-container">
        <h1>Register</h1>

        <form onSubmit={handleRegister}>
          <FormGroup
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
            label="Username"
            placeholder="Enter your username"
            type="text"
          />

          <FormGroup
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
            label="email"
            placeholder="Enter your email"
            type="email"
          />

          <FormGroup
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
            label="Password"
            placeholder="Enter your password"
            type="password"
          />

          <button className="button" type="submit">
            Register
          </button>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default Register