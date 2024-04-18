const db = require("../../models/index");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const ms = require("ms");
const createJWT = (payload) => {
  try {
    const key = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;
    return jwt.sign(payload, key, { expiresIn });
  } catch (error) {
    console.log(error);
  }
};

const verifyToken = (token) => {
  try {
    const key = process.env.JWT_SECRET;
    return jwt.verify(token, key);
  } catch (error) {
    console.log(error);
  }
};

const checkPassword = async (password, hashedPassword) => {
  const checkPass = await bcrypt.compare(password, hashedPassword);
  return checkPass;
};

const handleLoginAdmin = async (req, res) => {
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
          if (user.RoleId == 2) {
            return res.status(200).json({
              detail: "Bạn không có quyền truy cập !",
            });
          }
          let payload = {
            id: user.id,
            name: user.name,
            role_id: user.RoleId,
          };
          let token = createJWT(payload);
          res.cookie("jwt_admin", token, {
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

const handleAuthAdmin = async (req, res) => {
  try {
    if (req.cookies.jwt_admin) {
      let token = req.cookies.jwt_admin;
      let data_token = verifyToken(token);
      let user = await db.User.findOne({
        where: {
          id: data_token.id,
          RoleId: data_token.role_id,
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

const logoutAdmin = (req, res) => {
  try {
    res.clearCookie("jwt_admin");
    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công !",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleLoginAdmin,
  handleAuthAdmin,
  logoutAdmin,
};
