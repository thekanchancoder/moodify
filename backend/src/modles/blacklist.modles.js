const mongoose=require("mongoose")

const blackListSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required for blacklist"]
    }
},{
    timestamps:true
})

const blackListModel = mongoose.model("BlackList",blackListSchema)


module.exports = blackListModel