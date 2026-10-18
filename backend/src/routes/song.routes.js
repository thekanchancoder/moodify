const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middlewares");
const songController = require("../controllers/song.controller");
/* 
POST      /api/song/
*/


router.post('/',upload.single('song'),songController.uploadSong)

router.get("/",songController.getSong)

module.exports = router;