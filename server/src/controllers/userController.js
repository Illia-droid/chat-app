const { User } = require("../models/models");
const ApiError = require("../errors/ApiError");

class userController {
  async getUser(req, res, next) {
    console.log(req.params);

    try {
      const userId = req.params.id;
      const userData = await User.findByPk(userId);
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
