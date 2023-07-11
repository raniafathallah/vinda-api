const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//get products;
router.get('/', catchAsync(async (req, res) => {
  let filter = {};
  const sort = { '_id': -1 }
  // if (req.params.tourId) filter = { tour: req.params.tourId };

  // -> Building Query
  const features = new APIFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .chooseFields()
    .paginate();

  // -> Executing Query
  const document = await features.query;
if(!document){AppError('no products exist ',404)}
  // 200: OK Response   
  // const products = await Product.find(document).sort(sort);
  res.status(200).json(document);

}))


//create product
router.post('/', catchAsync(async (req, res) => {

  const { name, description, price, category, images: pictures } = req.body;
  const product = await Product.create({ name, description, price, category, pictures });
  if(!product){AppError('cannot create product',404)}

  const products = await Product.find();
  res.status(201).json(products);

}))


// update product

router.patch('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  const { name, description, price, category, images: pictures } = req.body;
  const product = await Product.findByIdAndUpdate(id, { name, description, price, category, pictures });
  const products = await Product.find();
  res.status(200).json(products);

}))


// delete product

router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const user = await User.findById(user_id);
  if (!user.isAdmin) return res.status(401).json("You don't have permission");
  await Product.findByIdAndDelete(id);
  const products = await Product.find();
  res.status(200).json(products);

}))


router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if(!product){AppError('no product exist ',404)}

  const similar = await Product.find({ category: product.category }).limit(5);
  res.status(200).json({ product, similar })

}));

router.get('/category/:category', catchAsync(async (req, res) => {
  const { category } = req.params;

  let products;
  const sort = { '_id': -1 }
  products = await Product.find({ category }).sort(sort)

  // if(category == "all"){
  //   products = await Product.find().sort(sort);
  // } else {
  //   products = await Product.find({category}).sort(sort)
  // }
  res.status(200).json(products)

}))

// cart routes

router.post('/add-to-cart', catchAsync(async (req, res) => {
  const { userId, productId, price } = req.body;

  const user = await User.findById(userId);
  const userCart = user.cart;
  if (user.cart[productId]) {
    userCart[productId] += 1;
  } else {
    userCart[productId] = 1;
  }
  userCart.count += 1;
  userCart.total = Number(userCart.total) + Number(price);
  user.cart = userCart;
  user.markModified('cart');
  await user.save();
  res.status(200).json(user);
  console.log(userCart);

}))

router.post('/increase-cart', catchAsync(async (req, res) => {
  const { userId, productId, price } = req.body;
  const user = await User.findById(userId);
  const userCart = user.cart;
  userCart.total += Number(price);
  userCart.count += 1;
  userCart[productId] += 1;
  user.cart = userCart;
  user.markModified('cart');
  await user.save();
  res.status(200).json(user);

}));

router.post('/decrease-cart', catchAsync(async (req, res) => {
  const { userId, productId, price } = req.body;
  const user = await User.findById(userId);
  const userCart = user.cart;
  userCart.total -= Number(price);
  userCart.count -= 1;
  userCart[productId] -= 1;
  user.cart = userCart;
  user.markModified('cart');
  await user.save();
  res.status(200).json(user);

}))

router.post('/remove-from-cart', catchAsync(async (req, res) => {
  const { userId, productId, price } = req.body;
  const user = await User.findById(userId);
  const userCart = user.cart;
  userCart.total -= Number(userCart[productId]) * Number(price);
  userCart.count -= userCart[productId];
  delete userCart[productId];
  user.cart = userCart;
  user.markModified('cart');
  await user.save();
  res.status(200).json(user);

}))



module.exports = router;
