import Comment from '../models/comments.js';
import User from '../models/user.js';
import extend from 'lodash/extend.js';
import { Op } from 'sequelize';

const create = async (req, res) => {
  try {
    const commentData = { ...req.body };
    commentData.recordedById = req.auth._id; // Using auth id

    let comment = await Comment.create(commentData);
    return res.status(200).json(comment);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const commentByID = async (req, res, next, id) => {
  try {
    let comment = await Comment.findByPk(id, {
      include: [{ model: User, as: 'recorded_by', attributes: ['id', 'name'] }]
    });
    if (!comment)
      return res.status(400).json({
        error: "Comment record not found"
      });
    req.comment = comment;
    next();
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const read = (req, res) => {
  return res.json(req.comment);
};

const allcomments = async (req, res) => {
  try {
    let comments = await Comment.findAll({
      order: [['incurred_on', 'DESC']],
      include: [{ model: User, as: 'recorded_by', attributes: ['id', 'name'] }]
    });
    return res.json(comments);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const listByUser = async (req, res) => {
  let firstDay = req.query.firstDay;
  let lastDay = req.query.lastDay;
  try {
    let query = { recordedById: req.auth._id };
    
    if (firstDay && lastDay) {
      query.incurred_on = {
        [Op.gte]: firstDay,
        [Op.lte]: lastDay
      };
    }

    let comments = await Comment.findAll({
      where: query,
      order: [['incurred_on', 'DESC']],
      include: [{ model: User, as: 'recorded_by', attributes: ['id', 'name'] }]
    });
    return res.json(comments);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const update = async (req, res) => {
  try {
    let comment = req.comment;
    comment = extend(comment, req.body);
    await comment.save();
    res.json(comment);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

export default { create, commentByID, read, allcomments, listByUser, update };