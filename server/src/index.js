require("dotenv").config();

const express = require("express");
const http = require("http"); // ← добавили
const sequelize = require("./db");
const models = require("./models/models");
const cors = require("cors");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandlerMiddleware");

// Импортируем Socket.IO
const createSocketServer = require("./sockets/socketServer");
const setupChatEvents = require("./sockets/chatEvents");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).json({ message: "hi!!!!" });
});

// Создаём HTTP-сервер
const server = http.createServer(app);

// Инициализируем Socket.IO
const io = createSocketServer(server);

// Подключаем события чата
setupChatEvents(io);

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    server.listen(PORT, () => {
      console.log(`Chat app listening on port ${PORT}!`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
