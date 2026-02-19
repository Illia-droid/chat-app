const ApiError = require("../errors/ApiError");

module.exports = (err, req, res, next) => {
  // Логируем всегда
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  // Можно добавить request id для трейсинга
  const errorResponse = {
    success: false,
    message: err.message || "Неизвестная ошибка",
  };

  if (err instanceof ApiError) {
    errorResponse.status = err.status;
    if (err.details) errorResponse.details = err.details;
    return res.status(err.status).json(errorResponse);
  }

  // Для неизвестных ошибок в development показываем больше инфы
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
    errorResponse.name = err.name;
  }

  res.status(500).json(errorResponse);
};
