const sequelize = require("./index");
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
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
    },
    displayName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      trim: true,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
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
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sender_id",
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "receiver_id",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: "messages",
    underscored: true,
    timestamps: true,
    paranoid: true,
  }
);

function defineAssociations() {
  User.hasMany(Message, {
    as: "sentMessages",
    foreignKey: "senderId",
    onDelete: "CASCADE",
  });

  User.hasMany(Message, {
    as: "receivedMessages",
    foreignKey: "receiverId",
    onDelete: "CASCADE",
  });

  Message.belongsTo(User, {
    as: "sender",
    foreignKey: "senderId",
    onDelete: "CASCADE",
  });

  Message.belongsTo(User, {
    as: "receiver",
    foreignKey: "receiverId",
    onDelete: "CASCADE",
  });
}

defineAssociations();

module.exports = {
  User,
  Message,
};