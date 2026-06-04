import Product from '../models/product.js';
import Shop from '../models/shop.js';
import extend from 'lodash/extend.js';
import formidable from 'formidable';
import fs from 'fs';
import { Op } from 'sequelize';

const defaultImage = '/public/restaurant-logo-images-vector.jpg';

const create = (req, res, next) => {
  let form = formidable({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Image could not be uploaded"
      });
    }
    
    let parsedFields = {};
    for (let key in fields) {
      parsedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    }

    parsedFields.shopId = req.shop.id;

    if (files.image) {
      let imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
      parsedFields.image = fs.readFileSync(imageFile.filepath);
      parsedFields.imageType = imageFile.mimetype;
    }

    try {
      let result = await Product.create(parsedFields);
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }
  });
};

const productByID = async (req, res, next, id) => {
  try {
    let product = await Product.findByPk(id, {
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name'] }]
    });
    if (!product)
      return res.status(400).json({
        error: "Product not found"
      });
    req.product = product;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve product"
    });
  }
};

const photo = (req, res, next) => {
  if (req.product.image) {
    res.set("Content-Type", req.product.imageType);
    return res.send(req.product.image);
  }
  next();
};

const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd() + defaultImage);
};

const read = (req, res) => {
  let productData = req.product.toJSON();
  productData.image = undefined;
  productData.imageType = undefined;
  return res.json(productData);
};

const update = (req, res) => {
  let form = formidable({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Photo could not be uploaded"
      });
    }
    
    let parsedFields = {};
    for (let key in fields) {
      parsedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    }

    let product = req.product;
    product = extend(product, parsedFields);

    if (files.image) {
      let imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
      product.image = fs.readFileSync(imageFile.filepath);
      product.imageType = imageFile.mimetype;
    }

    try {
      let result = await product.save();
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
    let product = req.product;
    await product.destroy();
    res.json(product);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const listByShop = async (req, res) => {
  try {
    let products = await Product.findAll({
      where: { shopId: req.shop.id },
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name'] }],
      attributes: { exclude: ['image', 'imageType'] }
    });
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const listLatest = async (req, res) => {
  try {
    let products = await Product.findAll({
      order: [['created', 'DESC']],
      limit: 5,
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name'] }],
      attributes: { exclude: ['image', 'imageType'] }
    });
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const listRelated = async (req, res) => {
  try {
    let products = await Product.findAll({
      where: {
        id: { [Op.ne]: req.product.id },
        category: req.product.category
      },
      limit: 5,
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name'] }],
      attributes: { exclude: ['image', 'imageType'] }
    });
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const listCategories = async (req, res) => {
  try {
    let products = await Product.findAll({
      attributes: ['category'],
      group: ['category']
    });
    let categories = products.map(p => p.category);
    res.json(categories);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const list = async (req, res) => {
  const query = {};
  if (req.query.search) {
    query.name = { [Op.like]: `%${req.query.search}%` };
  }
  if (req.query.category && req.query.category != 'All') {
    query.category = req.query.category;
  }
  
  try {
    let products = await Product.findAll({
      where: query,
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name'] }],
      attributes: { exclude: ['image', 'imageType'] }
    });
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const decreaseQuantity = async (req, res, next) => {
  try {
    await Promise.all(req.body.order.products.map(item => {
      // support item.product being passed as populated or raw string
      const productId = item.product.id || item.product._id || item.product;
      return Product.decrement('quantity', { by: item.quantity, where: { id: productId } });
    }));
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not update product"
    });
  }
};

const increaseQuantity = async (req, res, next) => {
  try {
    await Product.increment('quantity', { by: req.body.quantity, where: { id: req.product.id } });
    next();
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

export default {
  create,
  productByID,
  photo,
  defaultPhoto,
  read,
  update,
  remove,
  listByShop,
  listLatest,
  listRelated,
  listCategories,
  list,
  decreaseQuantity,
  increaseQuantity
};