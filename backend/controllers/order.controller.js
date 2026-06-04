import { Order, CartItem } from '../models/order.js';
import Product from '../models/product.js';
import Shop from '../models/shop.js';

const create = async (req, res) => {
  try {
    const orderData = req.body.order;
    orderData.userId = req.profile.id;

    // Create the Order
    const order = await Order.create(orderData);

    // Create related CartItems (from products array)
    if (orderData.products && orderData.products.length > 0) {
      const cartItems = orderData.products.map(item => ({
        ...item,
        orderId: order.id,
        productId: item.product,
        shopId: item.shop
      }));
      await CartItem.bulkCreate(cartItems);
    }

    res.status(200).json(order);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const listByShop = async (req, res) => {
  try {
    let orders = await Order.findAll({
      include: [{
        model: CartItem,
        as: 'products',
        where: { shopId: req.shop.id },
        include: [{ model: Product, as: 'product_details', attributes: ['id', 'name', 'price'] }]
      }],
      order: [['created', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const update = async (req, res) => {
  try {
    let item = await CartItem.update(
      { status: req.body.status },
      { where: { id: req.body.cartItemId } }
    );
    res.json(item);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const getStatusValues = (req, res) => {
  // Hardcoded enum based on model values
  res.json(['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']);
};

const orderByID = async (req, res, next, id) => {
  try {
    let order = await Order.findByPk(id, {
      include: [{
        model: CartItem,
        as: 'products',
        include: [
          { model: Product, as: 'product_details', attributes: ['name', 'price'] },
          { model: Shop, as: 'shop_details', attributes: ['name'] }
        ]
      }]
    });
    if (!order)
      return res.status(400).json({
        error: "Order not found"
      });
    req.order = order;
    next();
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const listByUser = async (req, res) => {
  try {
    let orders = await Order.findAll({
      where: { userId: req.profile.id },
      order: [['created', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const read = (req, res) => {
  return res.json(req.order);
};

export default {
  create,
  listByShop,
  update,
  getStatusValues,
  orderByID,
  listByUser,
  read
};