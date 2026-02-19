require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/models");
const ApiError = require("../errors/ApiError");

class authController {
  async registration(req, res, next) {
    try {
      const { body } = req;
      const { email, password } = body;

      if (!email || !password) {
        return next(ApiError.badRequest("Incorrect password or email"));
      }
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.badRequest("User is already existing"));
      }
      const hashPassword = await bcrypt.hash(password, 5);

      const user = await User.create({ ...body, password: hashPassword });

      const jwtoken = jwt.sign(
        { id: user.id, email },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: "24h" },
      );
      res.json({
        jwtoken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { body } = req;
      const { email, password } = body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.badRequest("User does not exist"));
      }
      let passwordCompare = bcrypt.compareSync(password, user.password);
      if (!passwordCompare) {
        return next(ApiError.badRequest("Password incorrect"));
      }
      const jwtoken = jwt.sign(
        { id: user.id, email },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: "24h" },
      );
      res.json({
        jwtoken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async check(req, res, next) {
    try {
      const { user } = req;
      const { email } = user;
      const userData = await User.findOne({ where: { email } });
      userData.password = undefined;
      return res.json(userData);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new authController();
