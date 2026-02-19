const Router = require("express");

const chatController = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = new Router();

router.post("/addMessage", authMiddleware, chatController.addMessage);
router.post("/groups", authMiddleware, chatController.createGroupChat);
// router.post("/registration", userController.registration);
// router.post("/login", userController.login);
// router.get("/auth", userController.check);

module.exports = router;
