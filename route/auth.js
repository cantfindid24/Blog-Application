import express from 'express';
const router = express.Router();
import User from '../model/user.js';
import generateToken from '../utils.js';
import bcrypt from 'bcryptjs';
import { checkUser } from '../middleware/authMiddleware.js';

const handleValidationError = (err) => {
  let errors = {};

  //duplicate error code
  if (err.code === 11000) {
    errors.email = 'an user with this email already exists';
    return errors;
  }

  //incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'that email is not registered';
  }
  //incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'that password is incorrect';
  }

  //validation errors
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

router
  .get('/signup', checkUser, (req, res) => {
    if (res.locals.user) return res.redirect('/');
    return res.render('signup');
  })
  .post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const newUser = await User.create({
        name,
        email,
        password,
      });
      const token = generateToken(newUser._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.status(201).json({ user: newUser._id });
    } catch (error) {
      const errors = handleValidationError(error);
      res.status(400).json({ errors });
    }
  });

router
  .get('/signin', checkUser, (req, res) => {
    if (res.locals.user) return res.redirect('/');
    return res.render('signin');
  })
  .post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
      const userExist = await User.findOne({ email });

      if (userExist) {
        const auth = await bcrypt.compare(password, userExist.password);

        if (auth) {
          const token = generateToken(userExist._id);
          res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          });
          return res.status(200).json({ user: userExist._id });
        } else throw Error('incorrect password');
      } else throw Error('incorrect email');
    } catch (err) {
      const errors = handleValidationError(err);
      return res.status(400).json({ errors });
    }
  })
  .get('/logout', async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  });

export default router;
