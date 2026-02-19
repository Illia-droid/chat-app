const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      field: "last_name",
    },
    displayName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      trim: true,
      field: "display_name",
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      field: "email", 
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password",
    },
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["email"] },
      { unique: true, fields: ["display_name"] }, // ← теперь snake_case
    ],
  }
);

const Conversation = sequelize.define(
  "conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("private", "group"),
      allowNull: false,
      defaultValue: "private",
      field: "type",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "name",
    },
  },
  {
    tableName: "conversations",
    underscored: true,
    timestamps: true,
    indexes: [{ fields: ["type"] }],
  }
);

const ConversationParticipant = sequelize.define(
  "conversation_participant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "conversation_id",
    },
  },
  {
    tableName: "conversation_participants",
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["user_id", "conversation_id"] },
      { fields: ["user_id"] },
      { fields: ["conversation_id"] },
    ],
  }
);

const Message = sequelize.define(
  "message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "content",
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sender_id",
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "conversation_id",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_read",
    },
  },
  {
    tableName: "messages",
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ["conversation_id", "created_at"] }, // ← snake_case + created_at
      { fields: ["sender_id"] },
    ],
  }
);

function defineAssociations() {
  User.belongsToMany(Conversation, {
    through: ConversationParticipant,
    as: "conversations",
    foreignKey: "userId",           // в JS camelCase
    otherKey: "conversationId",
    onDelete: "CASCADE",
  });

  Conversation.belongsToMany(User, {
    through: ConversationParticipant,
    as: "participants",
    foreignKey: "conversationId",
    otherKey: "userId",
    onDelete: "CASCADE",
  });

  Message.belongsTo(User, {
    as: "sender",
    foreignKey: "senderId",
    onDelete: "CASCADE",
  });

  User.hasMany(Message, {
    as: "sentMessages",
    foreignKey: "senderId",
    onDelete: "CASCADE",
  });

  Message.belongsTo(Conversation, {
    as: "conversation",
    foreignKey: "conversationId",
    onDelete: "CASCADE",
  });

  Conversation.hasMany(Message, {
    as: "messages",
    foreignKey: "conversationId",
    onDelete: "CASCADE",
  });
}

defineAssociations();

module.exports = {
  User,
  Conversation,
  ConversationParticipant,
  Message,
};