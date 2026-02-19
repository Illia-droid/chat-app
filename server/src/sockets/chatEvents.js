const {
  Message,
  Conversation,
  ConversationParticipant,
} = require("../models/models");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // Клиент присоединился к конкретному чату
    socket.on("joinChat", (chatId) => {
      if (!chatId) return;

      // Проверяем, что пользователь действительно участник этого чата
      ConversationParticipant.findOne({
        where: {
          user_id: socket.user.id,
          conversation_id: chatId,
        },
      })
        .then((participant) => {
          if (participant) {
            socket.join(`chat:${chatId}`);
            console.log(
              `Пользователь ${socket.user.id} присоединился к комнате chat:${chatId}`,
            );
            socket.emit("joinedChat", { chatId, success: true });
          } else {
            socket.emit("error", { message: "Нет доступа к этому чату" });
          }
        })
        .catch((err) => {
          console.error("Ошибка проверки доступа:", err);
          socket.emit("error", { message: "Ошибка сервера" });
        });
    });

    // Получение нового сообщения от клиента
    socket.on("sendMessage", async (data) => {
      const { chatId, content } = data;

      if (!chatId || !content?.trim()) {
        return socket.emit("error", {
          message: "Некорректные данные сообщения",
        });
      }

      try {
        // Проверяем доступ (на всякий случай)
        const participant = await ConversationParticipant.findOne({
          where: { user_id: socket.user.id, conversation_id: chatId },
        });

        if (!participant) {
          return socket.emit("error", { message: "Нет доступа к чату" });
        }

        // Сохраняем сообщение в БД
        const message = await Message.create({
          content: content.trim(),
          sender_id: socket.user.id,
          conversation_id: chatId,
          is_read: false,
        });

        // Рассылаем всем в комнате (включая отправителя)
        io.to(`chat:${chatId}`).emit("newMessage", {
          id: message.id,
          content: message.content,
          senderId: socket.user.id,
          senderName: socket.user.displayName,
          createdAt: message.createdAt,
        });

        // Можно также обновить unread для других участников (если нужно)
      } catch (err) {
        console.error("Ошибка отправки сообщения:", err);
        socket.emit("error", { message: "Не удалось отправить сообщение" });
      }
    });

    // Typing indicator
    socket.on("typing", ({ chatId, isTyping }) => {
      // Отправляем всем в комнате кроме отправителя
      socket.to(`chat:${chatId}`).emit("typing", {
        userId: socket.user.id,
        userName: socket.user.displayName,
        isTyping,
      });
    });

    // Отключение
    socket.on("disconnect", () => {
      console.log(
        `[SOCKET] Пользователь отключился: ${socket.user?.id || "аноним"} (${socket.id})`,
      );
    });
  });
};
