const songModel = require('../modles/song.modles');
const NodeID3 = require('node-id3');
const storageService=require('../services/storage.services');

async function uploadSong (req,res) {
    const songBuffer=req.file.buffer;
const {mood}=req.body
    const tags = NodeID3.read(songBuffer);



const [songFile, posterFile] = await Promise.all([
    storageService.uploadFile({
        buffer: songBuffer,
        fileName: tags.title + ".mp3",
        folder: "moodify/cohort"
    }),

    storageService.uploadFile({
        buffer: tags.image.imageBuffer,
        fileName: tags.title + ".jpeg",
        folder: "moodify/cohort/posters"
    })
]);


const song=await songModel.create({
 title:tags.title,
 mood,
 posterUrl:posterFile.url,
 url:songFile.url
})

res.status(201).json({
   
    message:"song created successfully",
    song
})

}


async function getSong(req,res){
    const {mood}=req.query;
    const song=await songModel.findOne(
        {mood}
    )
    res.status(200).json({
        message:"song fetched successfully",
        song
    })
}


module.exports = {uploadSong,getSong};