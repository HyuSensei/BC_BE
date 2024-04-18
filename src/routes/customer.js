const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/customer/ProductController");
const AuthController = require("../controllers/customer/AuthController");
const OrderController = require("../controllers/customer/OrderController");
const CategoryController = require("../controllers/customer/CategoryController");
const RateController = require("../controllers/customer/RateController");
const middleware = require("../middleware/middleware");

router.get("/products/home", ProductController.getProductHome);
router.get("/products/detail/:id", ProductController.getProductDetail);

router.post("/register", AuthController.handleRegister);
router.post("/login", AuthController.handleLogin);
router.get("/authentication", AuthController.handleAuth);
router.get("/logout", AuthController.logout);

// router.post("/order", middleware.middlewareCustomer, OrderController.addOrder);
router.post(
  "/order_off",
  middleware.middlewareCustomer,
  OrderController.addOrderOff
);

router.post(
  "/order_onl",
  middleware.middlewareCustomer,
  OrderController.addOrderOnl
);

router.get(
  "/order_wait/:user_id",
  middleware.middlewareCustomer,
  OrderController.getOrderWait
);
router.get(
  "/order_ship/:user_id",
  middleware.middlewareCustomer,
  OrderController.getOrderShip
);
router.get(
  "/order_complete/:user_id",
  middleware.middlewareCustomer,
  OrderController.getOrderComplete
);
router.get(
  "/order_cancel/:user_id",
  middleware.middlewareCustomer,
  OrderController.getOrderCancel
);
router.put(
  "/order_cancel_action/:order_id",
  middleware.middlewareCustomer,
  OrderController.handleCancelOrder
);
router.put(
  "/order_confirm_action/:order_id",
  OrderController.handleUpdateConfirm
);

router.get("/search", ProductController.getProductSearch);
router.get("/categories/", CategoryController.getAllCategory);
router.get("/categories/:category_id", CategoryController.getProductCategory);

router.get(
  "/rate/:order_id/:product_id/:user_id",
  middleware.middlewareCustomer,
  RateController.getProductRate
);
router.post("/rate", middleware.middlewareCustomer, RateController.handleRate);

router.post("/webhook/order", OrderController.listenWebhook);

module.exports = router;
