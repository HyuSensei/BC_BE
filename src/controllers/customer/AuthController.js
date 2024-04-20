const db = require("../../models/index");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const ms = require("ms");

const createJWT = (payload) => {
  let token = null;
  let key = process.env.JWT_SECRET;
  try {
    token = jwt.sign(payload, key, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.log(error);
  }
  return token;
};

const verifyToken = (token) => {
  let decoded = null;
  let key = process.env.JWT_SECRET;
  let data = null;
  try {
    decoded = jwt.verify(token, key);
    data = decoded;
  } catch (error) {
    console.log(error);
  }
  return data;
};

const checkEmail = async (email) => {
  const user = await db.User.findOne({
    where: {
      email: email,
    },
  });
  if (user) {
    return false;
  } else {
    return true;
  }
};

const checkUserName = async (username) => {
  const user = await db.User.findOne({
    where: {
      username: username,
    },
  });
  if (user) {
    return false;
  } else {
    return true;
  }
};

const checkPhone = async (phone) => {
  const user = await db.User.findOne({
    where: {
      phone: phone,
    },
  });
  if (user) {
    return false;
  } else {
    return true;
  }
};

const handleRegister = async (req, res) => {
  try {
    if (
      !req.body.name ||
      !req.body.username ||
      !req.body.email ||
      !req.body.phone ||
      !req.body.password
    ) {
      return res.status(400).json({
        detail: "Vui lòng điền đầy đủ thông tin đăng ký",
      });
    } else {
      let name = req.body.name;
      let username = req.body.username;
      let email = req.body.email;
      let password = req.body.password;
      let phone = req.body.phone;
      let isPhoneExit = await checkPhone(phone);
      let isEmailExit = await checkEmail(email);
      let isUserName = await checkUserName(username);
      if (isEmailExit == false) {
        return res.status(409).json({
          detail: "Email đã tồn tại !",
        });
      }
      if (isUserName == false) {
        return res.status(409).json({
          detail: "Tên đăng nhập đã tồn tại !",
        });
      }
      if (isPhoneExit == false) {
        return res.status(409).json({
          detail: "Số điện thoại đã tồn tại !",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.User.create({
        name: name,
        email: email,
        username: username,
        phone: phone,
        password: hashedPassword,
        RoleId: 2,
      });
      return res.status(200).json({
        success: true,
        message: "Đăng ký thành công !",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const checkPassword = async (password, hashedPassword) => {
  const checkPass = await bcrypt.compare(password, hashedPassword);
  return checkPass;
};

const handleLogin = async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        detail: "Vui lòng điền đầy đủ thông tin đăng nhập",
      });
    } else {
      let username = req.body.username;
      let password = req.body.password;
      let user = await db.User.findOne({
        where: { username: username },
      });
      if (!user) {
        return res.status(404).json({
          detail: "Tên đăng nhập không tồn tại !",
        });
      } else {
        let isPasswordExit = await checkPassword(password, user.password);
        if (!isPasswordExit) {
          return res.status(401).json({
            detail: "Mật khẩu không đúng vui lòng kiểm tra lại !",
          });
        } else {
          if (user.RoleId == 1) {
            return res.status(401).json({
              detail: "Vui lòng thử tài khoản khác !",
            });
          }
          let payload = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            expiresIn: process.env.JWT_EXPIRES_IN,
          };
          let token = createJWT(payload);
          res.cookie("jwt", token, {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            maxAge: ms(process.env.COOKIE_EXPIRES_IN),
          });
          return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công !",
            token: token,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const handleAuth = async (req, res) => {
  try {
    if (req.cookies.jwt) {
      let token = req.cookies.jwt;
      let data_token = verifyToken(token);
      let user = await db.User.findOne({
        where: {
          id: data_token.id,
          username: data_token.username,
          email: data_token.email,
        },
      });
      if (user) {
        let dataUser = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
        };
        return res.status(200).json({
          success: true,
          message: "Xác thực đăng nhập thành công !",
          user: dataUser,
        });
      } else {
        return res.status(200).json({
          detail: "Vui lòng hãy đăng nhập !",
        });
      }
    } else {
      return res.status(200).json({
        detail: "Vui lòng hãy đăng nhập !",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.end();
    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công !",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleAuth,
  logout,
};
