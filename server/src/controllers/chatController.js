const { Op } = require("sequelize");
const {
  User,
  Conversation,
  ConversationParticipant,
  Message,
} = require("../models/models");

const ApiError = require("../errors/ApiError");

class ChatController {
  async addMessage(req, res, next) {
    try {
      const senderId = req.user.id;
      const { content, conversationId } = req.body;

      if (!content?.trim()) {
        return next(ApiError.badRequest("Сообщение не может быть пустым"));
      }

      if (!conversationId) {
        return next(ApiError.badRequest("Укажите conversationId"));
      }

      const conversation = await Conversation.findByPk(conversationId, {
        include: [
          {
            model: User,
            as: "participants",
            where: { id: senderId },
            required: true,
            attributes: [],
          },
        ],
      });

      if (!conversation) {
        return next(ApiError.badRequest("Чат не найден или у вас нет доступа"));
      }

      const message = await Message.create({
        content: content.trim(),
        senderId,
        conversationId,
        isRead: false,
      });

      await conversation.update({ updatedAt: new Date() });

      const fullMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "displayName"],
          },
        ],
      });

      return res.status(201).json(fullMessage);
    } catch (err) {
      console.error("addMessage error:", err);
      return next(ApiError.internal("Ошибка при отправке сообщения"));
    }
  }

  async createGroupChat(req, res, next) {
    try {
      const creatorId = req.user.id;
      const { name, participantIds } = req.body;

      if (!name?.trim()) {
        return next(ApiError.badRequest("Название группы обязательно"));
      }

      if (!Array.isArray(participantIds) || participantIds.length < 1) {
        return next(ApiError.badRequest("Укажите хотя бы одного участника"));
      }

      const allParticipantIds = [
        ...new Set([creatorId, ...participantIds.map(Number)]),
      ];

      const existingUsers = await User.findAll({
        where: { id: { [Op.in]: allParticipantIds } },
        attributes: ["id"],
      });

      if (existingUsers.length !== allParticipantIds.length) {
        return next(
          ApiError.badRequest("Один или несколько пользователей не найдены"),
        );
      }

      const group = await Conversation.create({
        type: "group",
        name: name.trim(),
      });

      const participantsData = allParticipantIds.map((userId) => ({
        userId: userId,
        conversationId: group.id,
      }));

      await ConversationParticipant.bulkCreate(participantsData);

      const fullGroup = await Conversation.findByPk(group.id, {
        include: [
          {
            model: User,
            as: "participants",
            attributes: ["id", "displayName"],
            through: { attributes: [] },
          },
        ],
      });

      return res.status(201).json(fullGroup);
    } catch (err) {
      console.error("Ошибка в createGroupChat:", err);

      if (err.name === "SequelizeUniqueConstraintError") {
        return next(
          ApiError.badRequest(
            "Такая группа уже существует или конфликт данных",
          ),
        );
      }

      if (err.name === "SequelizeDatabaseError") {
        return next(
          ApiError.badRequest(
            "Ошибка базы данных: " + (err.parent?.message || err.message),
          ),
        );
      }

      return next(ApiError.internal("Не удалось создать группу"));
    }
  }
  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;

      const conversations = await Conversation.findAll({
        include: [
          {
            model: User,
            as: "participants",
            through: { attributes: [] },
            where: { id: userId },
            required: true,
            attributes: ["id", "displayName"],
          },
          {
            model: Message,
            as: "messages",
            limit: 1,
            order: [["createdAt", "DESC"]],
            include: [
              { model: User, as: "sender", attributes: ["displayName"] },
            ],
          },
        ],
        order: [["updatedAt", "DESC"]],
      });

      res.json(conversations);
    } catch (err) {
      console.error("getConversations error:", err);
      next(ApiError.internal("Ошибка загрузки чатов"));
    }
  }
  async getAllUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'displayName'], // только нужные поля
      order: [['displayName', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    next(ApiError.internal('Ошибка загрузки пользователей'));
  }
}

  // 2. Сообщения в конкретном чате
  async getMessages(req, res, next) {
    try {
      const { id: chatId } = req.params;
      const userId = req.user.id;

      // Проверяем доступ
      const participant = await ConversationParticipant.findOne({
        where: { conversation_id: chatId, user_id: userId },
      });

      if (!participant) {
        return next(ApiError.forbidden("Нет доступа к этому чату"));
      }

      const messages = await Message.findAll({
        where: { conversationId: chatId },
        include: [
          { model: User, as: "sender", attributes: ["id", "displayName"] },
        ],
        order: [["createdAt", "ASC"]],
        limit: 50, // можно добавить пагинацию позже
      });

      res.json(messages);
    } catch (err) {
      console.error("getMessages error:", err);
      next(ApiError.internal("Ошибка загрузки сообщений"));
    }
  }

  // 3. Создать/получить приватный чат 1:1
  async createOrGetPrivateChat(req, res, next) {
    try {
      const senderId = req.user.id;
      const { receiverId } = req.body;

      if (!receiverId || receiverId === senderId) {
        return next(ApiError.badRequest("Некорректный получатель"));
      }

      const conversation = await this.getOrCreatePrivateConversation(
        senderId,
        receiverId,
      );

      // Возвращаем с участниками
      const fullChat = await Conversation.findByPk(conversation.id, {
        include: [
          {
            model: User,
            as: "participants",
            attributes: ["id", "displayName"],
            through: { attributes: [] },
          },
        ],
      });

      res.json(fullChat);
    } catch (err) {
      next(ApiError.internal("Ошибка создания чата"));
    }
  }

  async getOrCreatePrivateConversation(senderId, receiverId) {
    if (senderId === receiverId) {
      throw ApiError.badRequest("Нельзя создать чат с самим собой");
    }

    let conversation = await Conversation.findOne({
      include: [
        {
          model: User,
          as: "participants",
          through: { attributes: [] },
          required: true,
          where: { id: senderId },
        },
        {
          model: User,
          as: "participants",
          through: { attributes: [] },
          required: true,
          where: { id: receiverId },
        },
      ],
      where: { type: "private" },
    });

    if (conversation) {
      return conversation;
    }

    conversation = await Conversation.create({ type: "private" });

    await ConversationParticipant.bulkCreate([
      { user_id: senderId, conversation_id: conversation.id },
      { user_id: receiverId, conversation_id: conversation.id },
    ]);

    return conversation;
  }
}

module.exports = new ChatController();
