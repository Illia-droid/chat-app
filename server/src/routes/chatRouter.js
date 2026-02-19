const Router = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");


const router = new Router();

// Применяем аутентификацию ко всем роутам чата
router.use(authMiddleware);

// Получить список всех чатов текущего пользователя
router.get("/conversations", chatController.getConversations);

// Получить сообщения конкретного чата
router.get("/conversations/:id/messages", chatController.getMessages);

// Отправить сообщение в любой чат (1:1 или группа)
router.post("/messages", chatController.addMessage);

// Создать новый приватный чат 1:1 (или получить существующий)
router.post("/conversations/private", chatController.createOrGetPrivateChat);

// Создать групповой чат
router.post("/groups", chatController.createGroupChat);

router.get("/users", chatController.getAllUsers);

// // Опционально: отметить чат как прочитанный (для unread count)
// router.patch("/conversations/:id/read", chatController.markAsRead);

// // Опционально: поиск пользователей (для добавления в чат/группу)
// router.get("/users/search", chatController.searchUsers);

module.exports = router;