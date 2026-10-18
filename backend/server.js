require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const dotenv = require('dotenv')
dotenv.config()

const app = require('./src/app')
const connectDB = require("./src/config/database.js");

connectDB()

app.listen(3000,()=>{
    console.log("Server is running on port 3000" )
})