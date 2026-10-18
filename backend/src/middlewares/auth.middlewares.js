const jwt = require("jsonwebtoken")

const redis = require("../config/cache")


const authUser = async (req,res,next) =>{
 try{  const token = req.cookies.jwtToken

if(!token){
   return res.status(401).json({message:"token not provided"})
}

const isTokenBlackListed = await redis.get(token)


if(isTokenBlackListed){
    return res.status(401).json({message:"token is blacklisted"})
}


     const decoded= jwt.verify(token,process.env.JWT_TOKEN)

     req.user= decoded
next()

}catch(err){
  
    return res.status(401).json({message:"token invalid"})
}

}


module.exports = {authUser}
