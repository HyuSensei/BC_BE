const db = require("../../models/index");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const addOrder = async (req, res) => {
  try {
    let cart = req.body.cart;
    let userOrder = req.body.user;
    if (cart.length === 0) {
      return res.status(400).json({
        detail: "Vui lòng thêm sản phẩm vào giỏ hàng để đặt hàng !",
      });
    } else {
      if (
        !req.body.user.name ||
        !req.body.user.phone ||
        !req.body.user.payment ||
        !req.body.user.address
      ) {
        return res.status(400).json({
          detail: "Vui lòng điền đầy đủ thông tin đặt hàng !",
        });
      } else {
        if (req.body.user.payment == "off") {
          await orderOff(cart, userOrder);
          return res.status(200).json({
            success: true,
            payment: "Thanh toán khi nhận hàng",
            message: "Đặt hàng thành công !",
          });
        }
        if (req.body.user.payment == "paypal") {
          await orderOnl(cart, userOrder);
          return res.status(200).json({
            success: true,
            payment: "Thanh toán paypal",
            message: "Đặt hàng thành công !",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const addOrderOff = async (req, res) => {
  try {
    let cart = req.body.cart;
    let userOrder = req.body.user;
    if (cart.length === 0) {
      return res.status(400).json({
        detail: "Vui lòng thêm sản phẩm vào giỏ hàng để đặt hàng !",
      });
    } else {
      if (
        !req.body.user.name ||
        !req.body.user.phone ||
        !req.body.user.payment ||
        !req.body.user.address
      ) {
        return res.status(400).json({
          detail: "Vui lòng điền đầy đủ thông tin đặt hàng !",
        });
      } else {
        await orderOff(cart, userOrder);
        return res.status(200).json({
          success: true,
          payment: "Thanh toán khi nhận hàng",
          message: "Đặt hàng thành công !",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const addOrderOnl = async (req, res) => {
  try {
    const cart = req.body.cart;
    const userOrder = req.body.user;
    if (cart.length === 0) {
      return res.status(400).json({
        detail: "Vui lòng thêm sản phẩm vào giỏ hàng để đặt hàng !",
      });
    }
    if (
      !req.body.user.name ||
      !req.body.user.phone ||
      !req.body.user.payment ||
      !req.body.user.address
    ) {
      return res.status(400).json({
        detail: "Vui lòng điền đầy đủ thông tin đặt hàng !",
      });
    }
    const lineItems = cart.map((item) => ({
      price_data: {
        currency: "vnd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price,
      },
      quantity: item.cartQuantity,
    }));
    const newCart = cart.map((item) => ({
      id: item.id,
      cartQuantity: item.cartQuantity,
      price: item.price,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/order_success",
      cancel_url: "http://localhost:3000/order_failed",
      payment_intent_data: {
        metadata: {
          cart: JSON.stringify(newCart),
          userOrder: JSON.stringify(userOrder),
        },
      },
    });
    //await orderOnl(cart, userOrder);
    return res.status(200).json({
      success: true,
      id: session.id,
    });
  } catch (error) {
    console.log(error);
  }
};

const orderOff = async (cart, userOrder) => {
  try {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      total += cart[i].price * cart[i].cartQuantity;
    }
    let orderInsert = await db.Order.create({
      payment: "Thanh toán khi nhận hàng",
      status: 0,
      name: userOrder.name,
      address: userOrder.address,
      phone: userOrder.phone,
      total: total,
      UserId: userOrder.user_id,
    });
    for (let i = 0; i < cart.length; i++) {
      await db.Order_Product.create({
        ProductId: cart[i].id,
        OrderId: orderInsert.id,
        quantity: cart[i].cartQuantity,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const orderOnl = async (cart, userOrder) => {
  try {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      total += cart[i].price * cart[i].cartQuantity;
    }
    let orderInsert = await db.Order.create({
      payment: "Thanh toán Online",
      status: 0,
      name: userOrder.name,
      address: userOrder.address,
      phone: userOrder.phone,
      total: total,
      UserId: userOrder.user_id,
    });
    for (let i = 0; i < cart.length; i++) {
      await db.Order_Product.create({
        ProductId: cart[i].id,
        OrderId: orderInsert.id,
        quantity: cart[i].cartQuantity,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getOrderWait = async (req, res) => {
  try {
    let user_id = req.params.user_id;
    let data = await db.Order.findAll({
      include: [
        {
          model: db.Order_Product,
          attributes: ["id", "OrderId", "ProductId", "quantity"],
          include: [
            {
              model: db.Product,
              attributes: ["name", "image", "price"],
              require: true,
            },
          ],
        },
      ],
      where: {
        UserId: user_id,
        status: 0,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Thông tin đơn hàng đang chờ duyệt !",
      orders: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const getOrderShip = async (req, res) => {
  try {
    let user_id = req.params.user_id;
    let data = await db.Order.findAll({
      include: [
        {
          model: db.Order_Product,
          attributes: ["id", "OrderId", "ProductId", "quantity"],
          include: [
            {
              model: db.Product,
              attributes: ["name", "image", "price"],
              require: true,
            },
          ],
        },
      ],
      where: {
        UserId: user_id,
        status: 1,
      },
    });
    return res.status(200).json({
      message: "Thông tin đơn hàng đang vận chuyển !",
      orders: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const getOrderComplete = async (req, res) => {
  try {
    let user_id = req.params.user_id;
    let data = await db.Order.findAll({
      include: [
        {
          model: db.Order_Product,
          attributes: ["id", "OrderId", "ProductId", "quantity"],
          include: [
            {
              model: db.Product,
              attributes: ["name", "image", "price"],
              require: true,
            },
          ],
        },
      ],
      where: {
        UserId: user_id,
        status: 2,
      },
    });
    let listRate = [];
    for (const order of data) {
      for (const orderProduct of order.Order_Products) {
        let rate = await db.Rate.findOne({
          where: {
            OrderId: order.id,
            ProductId: orderProduct.ProductId,
          },
        });
        if (rate) {
          listRate.push(rate);
        }
      }
    }
    return res.status(200).json({
      success: true,
      message: "Thông tin đơn hàng đã nhận !",
      orders: data,
      rates: listRate,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin đơn hàng.",
    });
  }
};

const getOrderCancel = async (req, res) => {
  try {
    let user_id = req.params.user_id;
    let data = await db.Order.findAll({
      include: [
        {
          model: db.Order_Product,
          attributes: ["id", "OrderId", "ProductId", "quantity"],
          include: [
            {
              model: db.Product,
              attributes: ["name", "image", "price"],
              require: true,
            },
          ],
        },
      ],
      where: {
        UserId: user_id,
        status: 3,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Thông tin đơn hàng đã hủy !",
      orders: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const handleCancelOrder = async (req, res) => {
  try {
    let order_id = req.params.order_id;
    await db.Order.update(
      {
        status: 3,
      },
      {
        where: {
          id: order_id,
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công !",
    });
  } catch (error) {
    console.log(error);
  }
};

const handleUpdateConfirm = async (req, res) => {
  try {
    let order_id = req.params.order_id;
    await db.Order.update(
      {
        status: 2,
      },
      {
        where: {
          id: order_id,
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "Xác nhận đã nhận đơn hàng thành công !",
    });
  } catch (error) {
    console.log(error);
  }
};

const listenWebhook = async (req, res) => {
  try {
    const data = req.body.data.object;
    const cart = JSON.parse(data.metadata.cart);
    const userOrder = JSON.parse(data.metadata.userOrder);
    return await orderOnl(cart, userOrder);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addOrder,
  getOrderWait,
  getOrderShip,
  getOrderComplete,
  getOrderCancel,
  handleCancelOrder,
  handleUpdateConfirm,
  addOrderOff,
  addOrderOnl,
  listenWebhook,
};
