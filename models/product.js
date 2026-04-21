import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Shop from './shop.js';

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.BLOB('long')
  },
  imageType: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated'
});

Product.belongsTo(Shop, { as: 'shop', foreignKey: 'shopId' });
Shop.hasMany(Product, { foreignKey: 'shopId' });

export default Product;