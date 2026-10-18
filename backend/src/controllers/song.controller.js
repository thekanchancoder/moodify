const songModel = require('../modles/song.modles');
const NodeID3 = require('node-id3');
const storageService = require('../services/storage.services');
// 1. YouTube service ko import karein
const youtubeService = require('../services/youtube.service');

async function uploadSong (req, res) {
    const songBuffer = req.file.buffer;
    const { mood } = req.body;
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

    const song = await songModel.create({
        title: tags.title,
        mood,
        posterUrl: posterFile.url,
        url: songFile.url
    });

    res.status(201).json({
        message: "song created successfully",
        song
    });
}

async function getSong(req, res) {
    const { mood } = req.query;
    const song = await songModel.findOne({ mood });
    res.status(200).json({
        message: "song fetched successfully",
        song
    });
}

// 2. YouTube API wala Naya Function
async function getSongsByMood(req, res) {
    try {
        const { mood } = req.query; // Postman se ?mood=happy aayega

        if (!mood) {
            return res.status(400).json({
                success: false,
                message: "Mood parameter missing hai"
            });
        }

        // YouTube service function call
        const playlist = await youtubeService.fetchSongsByMoodFromYouTube(mood);

        return res.status(200).json({
            success: true,
            mood: mood,
            playlist: playlist
        });
    } catch (error) {
        console.error("YouTube Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Songs fetch karne me issue aaya."
        });
    }
}

async function searchSongs(req, res) {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Query parameter 'q' is missing"
            });
        }

        const songs = await youtubeService.searchSongsOnYouTube(q);

        return res.status(200).json({
            success: true,
            query: q,
            songs: songs
        });
    } catch (error) {
        console.error("Search Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Songs search karne me issue aaya."
        });
    }
}

// 3. Export me getSongsByMood aur searchSongs ko add karein
module.exports = { 
    uploadSong, 
    getSong, 
    getSongsByMood,
    searchSongs
};