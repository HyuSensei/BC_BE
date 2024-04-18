const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/admin/OrderController");
const ProductController = require("../controllers/admin/ProductController");
const AuthController = require("../controllers/admin/AuthController");
const middleware = require("../middleware/middleware");

router.get(
  "/dashboard",
  middleware.middlewareAdmin,
  OrderController.OrderDashBoard
);
router.get("/orders", middleware.middlewareAdmin, OrderController.orderIndex);
router.get(
  "/orders/:order_id",
  middleware.middlewareAdmin,
  OrderController.getOrderDetail
);
router.put("/orders/confirm/:order_id", OrderController.confirmOrder);

router.delete(
  "/orders/delete/:order_id",
  middleware.middlewareAdmin,
  OrderController.deleteOrder
);

router.get(
  "/products",
  middleware.middlewareAdmin,
  ProductController.productIndex
);
router.post(
  "/products/store",
  middleware.middlewareAdmin,
  ProductController.storeProduct
);
router.delete(
  "/products/delete/:product_id",
  middleware.middlewareAdmin,
  ProductController.deleteProduct
);
router.put(
  "/products/update/",
  middleware.middlewareAdmin,
  ProductController.updateProduct
);
router.get(
  "/categories",
  middleware.middlewareAdmin,
  ProductController.getCategoryAdd
);

router.get(
  "/authentication",
  middleware.middlewareAdmin,
  AuthController.handleAuthAdmin
);
router.get("/logout", middleware.middlewareAdmin, AuthController.logoutAdmin);
router.post("/login", AuthController.handleLoginAdmin);

module.exports = router;
