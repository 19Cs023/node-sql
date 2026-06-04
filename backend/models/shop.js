import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';

const Shop = sequelize.define('Shop', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.BLOB('long') // Stores image data
  },
  imageType: {
    type: DataTypes.STRING // Stores content type
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated'
});

Shop.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Shop, { foreignKey: 'ownerId' });

export default Shop;