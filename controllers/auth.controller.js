import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';

const signin = async (req, res) => {
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.authenticate(req.body.password)) {
      return res.status(401).send({ error: 'Email and password don\'t match.' });
    }
    const token = jwt.sign({ _id: user.id }, 'secret');
    res.cookie('t', token, { expire: new Date() + 9999 });
    return res.json({ 
      token, 
      user: { 
        _id: user.id, 
        name: user.name, 
        email: user.email,
        is_shop_keeper: user.is_shop_keeper
      }
    });
  } catch (err) {
    return res.status(401).json({ error: 'Could not sign in' });
  }
};

const signout = (req, res) => {
  res.clearCookie('t');
  return res.status(200).json({ message: 'signed out' });
};

const requireSignin = expressjwt({
  secret: 'secret',
  algorithms: ['HS256'],
  userProperty: 'auth'
});

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && String(req.profile.id) === String(req.auth._id);
  if (!(authorized)) {
    return res.status(403).json({ error: 'User is not authorized' });
  }
  next();
};

export default { signin, signout, requireSignin, hasAuthorization };