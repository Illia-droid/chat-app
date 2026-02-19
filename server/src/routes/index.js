const Router = require("express");
const router = new Router();

const userRouter = require("./userRouter");
const chatRouter = require("./chatRouter");
const authMiddleware = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");

router.use("/user", userRouter);

router.use("/chat",  chatRouter);





module.exports = router;
