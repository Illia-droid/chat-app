const Router = require("express");
const router = new Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

router.post("/registration", authController.registration);
router.post("/login", authController.login);
router.get("/auth", authMiddleware, authController.check);

router.get("/getUser", authMiddleware, userController.getUser);

module.exports = router;
