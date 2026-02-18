const Router = require("express");
const router = new Router();

const userRouter = require("./userRouter");
const messageRouter = require("./messageRouter");

router.use("/user", userRouter);

router.use("/message", messageRouter);

module.exports = router;
