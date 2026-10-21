const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors")

const app = express();



app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use (express.static("./public"))

module.exports = app


const authRoutes = require("./routes/auth.routes.js")
const songRoutes = require("./routes/song.routes.js")
app.use("/api/auth",authRoutes)
app.use("/api/song",songRoutes)