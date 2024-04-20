const db = require("../../models/index");
const multer = require("multer");
const fs = require("fs");

const productIndex = async (req, res) => {
  try {
    let limit = 5;
    let page = req.query.page;
    if (!page) {
      page = 1;
    }
    const { count, rows: products } = await db.Product.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
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

const getCategoryAdd = async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    return res.status(200).json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    console.log(error);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, res) => {
    res(null, "./src/public/images/products");
  },
  filename: (req, file, res) => {
    res(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const storeProduct = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      const { name, price, quantity, category_id, description } = req.body;
      let image = "";
      if (req.file) {
        image = req.file.originalname;
      }
      if (
        !name ||
        !price ||
        !quantity ||
        !category_id ||
        !description ||
        !image
      ) {
        fs.unlinkSync(req.file.path);
        return res.status(200).json({
          success: false,
          detail: "Vui lòng điền đủ thông tin",
        });
      }
      //const id = Math.floor(Math.random() * 10000);
      let data = await db.Product.create({
        // id,
        name: name,
        price: price,
        quantity: quantity,
        CategoryId: category_id,
        description: description,
        image: "/images/products/" + image,
      });
      if (data) {
        return res.status(200).json({
          success: true,
          message: "Thêm sản phẩm thành công",
          product: data,
        });
      }
    });
  } catch (error) {
    fs.unlinkSync(req.file.path);
    console.log(error);
  }
};

const updateProduct = (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      console.log(req.body);
      console.log(req.file);
      const { name, price, quantity, category_id, description, product_id } =
        req.body;
      let image = "";
      if (req.file) {
        image = "/images/products/" + req.file.originalname;
      } else {
        image = req.body.image;
      }
      if (!name || !price || !quantity || !category_id || !description) {
        fs.unlinkSync(req.file.path);
        return res.status(200).json({
          success: false,
          detail: "Vui lòng điền đủ thông tin",
        });
      }
      await db.Product.update(
        {
          name: name,
          image: image,
          price: price,
          quantity: quantity,
          CategoryId: category_id,
          description: description,
        },
        {
          where: {
            id: product_id,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: `Cập nhật sản phẩm ID:${product_id} thành công`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    let product = await db.Product.findOne({
      where: {
        id: product_id,
      },
    });
    if (product) {
      let product_order = await db.Order_Product.findOne({
        where: {
          ProductId: product_id,
        },
      });
      if (!product_order) {
        await db.Rate.destroy({
          where: {
            ProductId: product_id,
          },
        });
        await db.Product.destroy({
          where: {
            id: product_id,
          },
        });
        return res.status(200).json({
          success: true,
          message: `Xóa sản phẩm ID: ${product_id} thành công`,
        });
      } else {
        return res.status(200).json({
          success: false,
          detail: `Sản phẩm đang tồn tại ở đơn hàng ID: ${product_order.OrderId}`,
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        detail: "Không tồn tại sản phẩm",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  productIndex,
  storeProduct,
  getCategoryAdd,
  deleteProduct,
  updateProduct,
};
