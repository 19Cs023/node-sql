import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Product from './product.js';
import Shop from './shop.js';

const Order = sequelize.define('Order', {
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  pincode: DataTypes.STRING,
  payment_id: DataTypes.STRING
}, {
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated'
});

Order.belongsTo(User, { as: 'user', foreignKey: 'userId' });

const CartItem = sequelize.define('CartItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Not processed'
  }
});

CartItem.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(CartItem, { as: 'products', foreignKey: 'orderId' });

CartItem.belongsTo(Product, { as: 'product_details', foreignKey: 'productId' });
CartItem.belongsTo(Shop, { as: 'shop_details', foreignKey: 'shopId' });

export { Order, CartItem };