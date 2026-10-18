// es code ka kaam h server ko redis se connect krna h

const Redis = require("ioredis").default  

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    keepAlive: 10000, // Keeps TCP connection active with Redis Cloud
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
})

redis.on("connect", () => {
    console.log("server is connected to redis")
})

redis.on("error", (error) => {
    if (error.code === 'ECONNRESET') {
        console.log("Redis connection reset, reconnecting...")
    } else {
        console.log("Redis Error:", error)
    }
})

module.exports = redis
