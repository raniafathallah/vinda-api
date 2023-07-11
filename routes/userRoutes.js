const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// signup

router.post('/signup', async(req, res)=> {
  const {name, email, password} = req.body;

  try {
    const user = await User.create({name, email, password});
    res.json(user);
  } catch (e) {
    if(e.code === 11000) return     AppError('Email already exists',404);
    res.status(400).send(e.message)
    AppError(e.message,400)

  }
})

// login

router.post('/login',catchAsync(  async(req, res) => {
  const {email, password} = req.body;
    const user = await User.findByCredentials(email, password);
    res.json(user)
 
}))

// get users;

router.get('/',catchAsync(  async(req, res)=> {
    const users = await User.find({ isAdmin: false }).populate('orders');
    res.json(users);

}))

// get user orders

router.get('/:id/orders',catchAsync(  async (req, res)=> {
  const {id} = req.params;
    const user = await User.findById(id).populate('orders');
    res.json(user.orders);

}))
// update user notifcations
router.post('/:id/updateNotifications', catchAsync( async(req, res)=> {
  const {id} = req.params;
    const user = await User.findById(id);
    user.notifications.forEach((notif) => {
      notif.status = "read"
    });
    user.markModified('notifications');
    await user.save();
    res.status(200).send();

}))

module.exports = router;
