const { User } = require("../models/models");
const ApiError = require("../errors/ApiError");

class userController {
  async getUser(req, res, next) {
    try {
      const { email } = req.user;
      const userData = await User.findOne({ where: { email } });
      if (!userData) {
        return next(ApiError.badRequest("There is no user data yet"));
      }
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new userController();
