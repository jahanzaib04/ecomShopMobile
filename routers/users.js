const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// require('dotenv/config');

router.get('/', async (req, res) => {
  const userList = await User.find().select('-passwordHash');
  // const userList = await User.find().select('name email phone');
  //               Compare Password
  // const pass = bcrypt.compareSync('test123', userList[0].passwordHash);
  // console.log(pass);
  if (!userList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(userList);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  // const user = await User.findById(req.params.id, { passwordHash: 0 });
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User with this id not found',
    });
  }
  res.status(200).send(user);
});

router.post('/register', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(
      req.body.password,
      Number.parseInt(process.env.HASH)
    ),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) return res.status(400).send('the user cannot be created!');

  res.send(user);
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send('Username or Password is Wrong');
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRET,
      { expiresIn: process.env.EXPIRE_TIME }
    );

    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send('Username or Password is Wrong');
  }
});

router.get('/get/count', async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({
    userCount: userCount,
  });
});

router.delete('/:id', (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res.status(200).json({
          success: true,
          message: ' The User is deleted',
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(
        req.body.password,
        Number.parseInt(process.env.HASH)
      ),
      phone: req.body.phone,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );
  if (!user) return res.status(400).send('the user cannot be updated!');

  res.status(200).send(user);
});

module.exports = router;
