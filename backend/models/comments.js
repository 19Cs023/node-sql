import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';

const Comment = sequelize.define('Comment', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  incurred_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated'
});

Comment.belongsTo(User, { as: 'recorded_by', foreignKey: 'recordedById' });
User.hasMany(Comment, { foreignKey: 'recordedById' });

export default Comment;