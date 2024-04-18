const db = require("../../models/index");

const getProductRate = async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const product_id = req.params.product_id;
    const user_id = req.params.user_id;
    const order = await db.Order.findOne({
      where: {
        id: order_id,
        UserId: user_id,
        status: 2,
      },
    });
    if (order) {
      const order_product = await db.Order_Product.findOne({
        where: {
          OrderId: order_id,
          ProductId: product_id,
        },
      });
      if (order_product) {
        const rate = await db.Rate.findOne({
          where: {
            OrderId: order_id,
            ProductId: product_id,
          },
        });
        if (rate) {
          return res.status(200).json({
            success: true,
            message: "Sản phẩm đã được đánh giá ",
          });
        } else {
          let product = await db.Product.findOne({
            where: {
              id: product_id,
            },
          });
          return res.status(200).json({
            success: true,
            product: product,
          });
        }
      } else {
        return res.status(200).json({
          success: true,
          message: "Không tồn tại sản phẩm cần đánh giá ",
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Đơn hàng chưa hoàn thành",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const handleRate = async (req, res) => {
  try {
    let { product_id, order_id, user_id, rating, comment } = req.body;
    if (!req.body.rating || !req.body.comment) {
      return res.status(400).json({
        detail: "Vui lòng chọn đầy đủ thông tin đánh giá !",
      });
    }
    let data = await db.Rate.create({
      ProductId: product_id,
      UserId: user_id,
      OrderId: order_id,
      star: rating,
      comment: comment,
    });
    return res.status(200).json({
      success: true,
      message: "Đánh giá sản phẩm thành công!",
      rate: data,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getProductRate,
  handleRate,
};
