const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./user-model');
const Favourite = require('../favourites/favourite-model');

const signToken = id => 
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    expiresIn: +process.env.JWT_EXPIRES_IN,
    data: {
      user
    }
  });
};

exports.signup = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (user !== null) {
    return res.status(401).send('This username is already taken.');
  }
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.password
  });
  console.log(newUser)
  await Favourite.create({
    user: newUser._id,
    teams: [],
    matches: [],
    leagues: []
  })
  createSendToken(newUser, 201, req, res);
};

exports.login = async (req, res, next) => {
  console.log(req.body)
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.status(401).send('Empty username or password');
    //return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).send('Invalid username or password');
    //return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  console.log(123)
  createSendToken(user, 200, req, res);
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return res.status(401).send('Token expired.');
    /*return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );*/
  }

  console.log(Date.now(), jwt.decode(token).exp)
  if (Date.now() >= jwt.decode(token).exp * 1000) {
    return res.status(401).send('Token expired.');
  }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
      return res.status(401).send();

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  // res.locals.user = currentUser;
  next();
};