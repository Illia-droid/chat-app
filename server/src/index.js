require("dotenv").config();

const express = require("express");
const sequelize = require("./models/index");
const models = require("./models/models");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "hi!!!!" });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Chat app listening on port ${PORT}!`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
