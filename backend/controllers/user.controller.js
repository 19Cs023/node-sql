import User from '../models/user.js';
import extend from 'lodash/extend.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_temp');

const create = async (req, res) => {
  try {
    await User.create(req.body);
    return res.status(200).json({
      message: "Successfully signed up!"
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findByPk(id);
    if (!user)
      return res.status(400).json({
        error: "User not found"
      });
    req.profile = user;
    next();
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

const list = async (req, res) => {
  try {
    let users = await User.findAll({
      attributes: ['id', 'name', 'email', 'updated', 'created']
    });
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const update = async (req, res) => {
  try {
    let user = req.profile;
    user = extend(user, req.body);
    await user.save();
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const remove = async (req, res) => {
  try {
    let user = req.profile;
    await user.destroy();
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const stripeCustomer = async (req, res, next) => {
  try {
    let user = req.profile;
    if (user.stripe_customer) {
      return next();
    }
    const customer = await stripe.customers.create({
      email: user.email,
    });
    user.stripe_customer = customer.id;
    await user.save();
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export default { create, userByID, read, list, remove, update, stripeCustomer };