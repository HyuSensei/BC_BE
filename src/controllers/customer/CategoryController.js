const db = require("../../models/index");

const getAllCategory = async (req, res) => {
  try {
    const category_skincare = await db.Category.findAll({
      where: {
        CategoryParentId: 1,
      },
    });
    const category_makeup = await db.Category.findAll({
      where: {
        CategoryParentId: 2,
      },
    });
    return res.status(200).json({
      success: true,
      category_skincare: category_skincare,
      category_makeup: category_makeup,
    });
  } catch (error) {
    console.log(error);
  }
};

const getProductCategory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    let category_id = req.params.category_id;
    const { count, rows: products } = await db.Product.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
      where: {
        CategoryId: category_id,
      },
    });
    const totalPage = Math.ceil(count / limit);
    const result = {
      success: true,
      total_product: count,
      total_page: totalPage,
      current_page: page,
      products: products,
    };
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllCategory,
  getProductCategory,
};
