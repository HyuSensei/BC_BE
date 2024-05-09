const db = require("../../models/index");

const OrderDashBoard = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const countUser = await db.User.count();
    const countProduct = await db.Product.count();
    const countOrder = await db.Order.count();
    const countOrderShip = await db.Order.count({
      where: {
        status: 1,
      },
    });
    const { count, rows: orders } = await db.Order.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
    });
    const totalPage = Math.ceil(count / limit);
    return res.status(200).json({
      success: true,
      count_user: countUser,
      count_product: countProduct,
      count_order: countOrder,
      count_order_ship: countOrderShip,
      total_product: count,
      total_page: totalPage,
      current_page: page,
      orders: orders,
    });
  } catch (error) {
    console.log(error);
  }
};

const orderIndex = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const { count, rows: orders } = await db.Order.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
    });
    const totalPage = Math.ceil(count / limit);
    const result = {
      success: true,
      total_product: count,
      total_page: totalPage,
      current_page: page,
      orders: orders,
    };
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

const confirmOrder = async (req, res) => {
  try {
    const order_id = req.params.order_id;
    console.log("order_id", order_id);
    const order = await db.Order.findOne({
      where: {
        id: order_id,
      },
    });
    if (!order) {
      return res.status(404).json({
        detail: "Không tồn tại đơn hàng",
      });
    }
    await db.Order.update(
      {
        status: 1,
      },
      {
        where: {
          id: order_id,
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "Duyệt đơn hàng thành công",
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const order = await db.Order.findOne({
      where: {
        id: order_id,
      },
    });
    if (!order) {
      return res.status(404).json({
        detail: "Không tồn tại đơn hàng",
      });
    }
    await db.Rate.destroy({
      where: {
        OrderId: order_id,
      },
    });
    await db.Order_Product.destroy({
      where: {
        OrderId: order_id,
      },
    });
    await db.Order.destroy({
      where: {
        id: order_id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (error) {
    console.log(error);
  }
};

const getOrderDetail = async (req, res) => {
  try {
    let order_id = req.params.order_id;
    let data = await db.Order.findOne({
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
        id: order_id,
      },
    });
    return res.status(200).json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  OrderDashBoard,
  orderIndex,
  confirmOrder,
  deleteOrder,
  getOrderDetail,
};
