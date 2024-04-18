const jwt = require("jsonwebtoken");
const db = require("../models/index");
require("dotenv").config();

const verifyToken = (token) => {
  try {
    const key = process.env.JWT_SECRET;
    return jwt.verify(token, key);
  } catch (error) {
    console.log(error);
  }
};

const middlewareCustomer = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(200).json({
        detail: "Vui lòng hãy đăng nhập !",
      });
    }
    const data_token = verifyToken(token);
    const user = await db.User.findOne({
      where: {
        id: data_token.id,
        username: data_token.username,
        email: data_token.email,
      },
    });
    if (!user) {
      return res.status(200).json({
        detail: "Vui lòng hãy đăng nhập !",
      });
    }
    next();
    // if (req.cookies.jwt) {
    //   let token = req.cookies.jwt;
    //   let data_token = verifyToken(token);
    //   let user = await db.User.findOne({
    //     where: {
    //       id: data_token.id,
    //       username: data_token.username,
    //       email: data_token.email,
    //     },
    //   });
    //   if (user) {
    //     next();
    //   } else {
    //     return res.status(200).json({
    //       detail: "Vui lòng hãy đăng nhập !",
    //     });
    //   }
    // } else {
    //   return res.status(200).json({
    //     detail: "Vui lòng hãy đăng nhập !",
    //   });
    // }
  } catch (error) {
    console.log(error);
  }
};

const middlewareAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_admin;
    if (!token) {
      return res.status(200).json({
        detail: "Vui lòng hãy đăng nhập !",
      });
    }
    const data_token = verifyToken(token);
    const user = await db.User.findOne({
      where: {
        id: data_token.id,
        RoleId: data_token.role_id,
      },
    });
    if (!user) {
      return res.status(200).json({
        detail: "Vui lòng hãy đăng nhập !",
      });
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { middlewareCustomer, middlewareAdmin };
