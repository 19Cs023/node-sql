import Shop from '../models/shop.js';
import User from '../models/user.js';
import extend from 'lodash/extend.js';
import formidable from 'formidable';
import fs from 'fs';

const defaultImage = '/public/reatarent.avif';

const create = (req, res) => {
  let form = formidable({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ message: "Image could not be uploaded" });
      return;
    }
    
    let parsedFields = {};
    for (let key in fields) {
      parsedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    }
    
    parsedFields.ownerId = req.profile.id;

    if (files.image) {
      let imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
      parsedFields.image = fs.readFileSync(imageFile.filepath);
      parsedFields.imageType = imageFile.mimetype;
    }

    try {
      let result = await Shop.create(parsedFields);
      res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }
  });
};

const shopByID = async (req, res, next, id) => {
  try {
    let shop = await Shop.findByPk(id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }]
    });
    if (!shop)
      return res.status(400).json({
        error: "Shop not found"
      });
    req.shop = shop;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve shop"
    });
  }
};

const photo = (req, res, next) => {
  if (req.shop.image) {
    res.set("Content-Type", req.shop.imageType);
    return res.send(req.shop.image);
  }
  next();
};

const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd() + defaultImage);
};

const read = (req, res) => {
  let shopData = req.shop.toJSON();
  shopData.image = undefined;
  shopData.imageType = undefined;
  return res.json(shopData);
};

const update = (req, res) => {
  let form = formidable({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ message: "Photo could not be uploaded" });
      return;
    }
    
    let parsedFields = {};
    for (let key in fields) {
      parsedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    }

    let shop = req.shop;
    shop = extend(shop, parsedFields);

    if (files.image) {
      let imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
      shop.image = fs.readFileSync(imageFile.filepath);
      shop.imageType = imageFile.mimetype;
    }

    try {
      let result = await shop.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }
  });
};

const remove = async (req, res) => {
  try {
    let shop = req.shop;
    await shop.destroy();
    res.json(shop);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const list = async (req, res) => {
  try {
    let shops = await Shop.findAll();
    res.json(shops);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const listByOwner = async (req, res) => {
  try {
    let shops = await Shop.findAll({
      where: { ownerId: req.profile.id },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }]
    });
    res.json(shops);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const isOwner = (req, res, next) => {
  const isOwner = req.shop && req.auth && String(req.shop.ownerId) === String(req.auth._id);
  if (!isOwner) {
    return res.status(403).json({
      error: "User is not authorized"
    });
  }
  next();
};

export default {
  create,
  shopByID,
  photo,
  defaultPhoto,
  list,
  listByOwner,
  read,
  update,
  isOwner,
  remove
};