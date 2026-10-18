const express = require("express");
const authControllers = require("../controllers/auth.controllers.js")
const authMiddleware = require("../middlewares/auth.middlewares")
const router = express.Router();

/* 
/api/auth/register
/api/auth/login
*/
 
router.post("/register",authControllers.registerUser)
router.post("/login",authControllers.userLogin)

router.get("/get-me",authMiddleware.authUser,authControllers.getMe)

router.get("/logout",authMiddleware.authUser,authControllers.userLogout)

module.exports = router;
