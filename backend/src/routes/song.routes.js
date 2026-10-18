const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middlewares");
const songController = require("../controllers/song.controller");

/* 
POST   /api/song/       -> Local song upload karne ke liye
GET    /api/song/       -> Generic songs list 
GET    /api/song/mood   -> YouTube API se mood ke hisab se songs fetch karne ke liye
*/

router.post('/', upload.single('song'), songController.uploadSong);

router.get("/", songController.getSong);

// Naya route add karein:
router.get("/mood", songController.getSongsByMood);
router.get("/search", songController.searchSongs);

module.exports = router;