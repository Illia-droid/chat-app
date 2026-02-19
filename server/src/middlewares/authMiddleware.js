require("dotenv").config();
const jwt = require("jsonwebtoken");
const ApiError = require("../errors/ApiError");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(ApiError.badRequest("Нет токена авторизации"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(ApiError.badRequest(err));
  }
};
