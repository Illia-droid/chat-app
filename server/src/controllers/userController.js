const ApiError = require("../errors/ApiError");

class UserController {
  async registration(req, res, next) {}
  async login(req, res, next) {}
  async check(req, res, next) {
    const { id } = req.query;
    if (!id) {
      return next(ApiError.badRequest("Не задан ID"));
    }
    res.json(id);
  }
}

module.exports = new UserController();
