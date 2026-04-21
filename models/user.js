import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import crypto from 'crypto';

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  hashed_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salt: {
    type: DataTypes.STRING
  },
  is_shop_keeper: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  stripe_customer: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.VIRTUAL,
    set(val) {
      this.setDataValue('password', val);
      this.setDataValue('salt', Math.round((new Date().valueOf() * Math.random())) + '');
      this.setDataValue('hashed_password', crypto.createHmac('sha1', this.getDataValue('salt')).update(val).digest('hex'));
    }
  }
}, {
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated'
});

User.prototype.authenticate = function(plainText) {
  return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex') === this.hashed_password;
};

export default User;