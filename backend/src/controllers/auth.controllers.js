
const userModel = require("../modles/user.modles.js")
const blackListModel = require("../modles/blacklist.modles.js")
const redis = require("../config/cache")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


const registerUser = async (req,res) =>{
    try {
        const {username,email,password} = req.body

        const isUserAlreadyRegister = await userModel.findOne({$or:[
            {username},
            {email}
        ]})

        if(isUserAlreadyRegister){
            return res.status(400).json({message:"User is already registered"})
        }

const hash = await bcrypt.hash(password,10)

const user = await userModel.create({
    username,
    email,
    password:hash
})

const jwtToken = jwt.sign({
    id:user._id,
    username:user.username,
},process.env.JWT_TOKEN,{expiresIn:"2d"})

res.cookie("jwtToken",jwtToken)


return res.status(201).json({message:"User registered successfully",
    user:{
        id:user._id,
        username:user.username,
        email:user.email
    }
})
   



    } catch (error) {
        return res.status(500).json({message:"Something went wrong"})
    }
}

const userLogin = async (req,res) =>{
    try {
        const {username,email,password} = req.body

        const user = await userModel.findOne({$or:[{username},{email}]}).select("+password")

        if(!user){
            return res.status(400).json({message:"Invalid credentials"})
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)

        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid credentials"})
        }

        const jwtToken = jwt.sign({
            id:user._id,
            username:user.username,
        },process.env.JWT_TOKEN,{expiresIn:"2d"})

        res.cookie("jwtToken",jwtToken)

        return res.status(200).json({message:"User logged in successfully",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
    } catch (error) {
        return res.status(500).json({message:"Something went wrong"})
    }
}

const getMe = async (req,res) =>{
    try {
        const user = await userModel.findById(req.user.id)
        return res.status(200).json({
            message:"User found successfully",
            user})

    } catch (error) {
        return res.status(500).json({message:"Something went wrong"})
    }
}


const userLogout = async (req,res) =>{
    try {
        const token= req.cookies.jwtToken;
        res.clearCookie("jwtToken");

        if (token) {
            try {
                await redis.set(token, Date.now().toString(), "EX", 60 * 60);
            } catch (redisErr) {
                console.error("Redis blacklist error on logout:", redisErr);
            }
        }

        return res.status(200).json({message:"User logged out successfully"});
    } catch (error) {
        return res.status(500).json({message:"Something went wrong"});
    }
}


// redis data ko key value pair me store krta h

module.exports = {registerUser,userLogin,getMe,userLogout}