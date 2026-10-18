const mongoose = require("mongoose");


const songSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },

 posterUrl: {
        type: String,
        required: true
    },
     title: {
        type: String,
        required: true
    },
    mood:{
        type:String,
        enum:{
            values:["happy","sad","surprised"],
            message:"Please provide a valid mood"
        },
       required: true
    }

    
})

const songModel=mongoose.model("song",songSchema)

module.exports =songModel