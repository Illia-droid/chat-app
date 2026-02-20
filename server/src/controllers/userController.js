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
  async updateUser(req, res, next) {
    try {
      const userId = req.params.id;

      const allowedFields = ["displayName", "email", "firstName", "lastName"];

      const updateData = {};

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const userData = await User.findByPk(userId);

      if (!userData) {
        return next(ApiError.badRequest("User not found"));
      }

      await userData.update(updateData);

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new userController();
