import express from 'express';
// import connectMongoDb from './connection.js';
const app = express();
import path from 'path';
import auth from './route/auth.js';
import blog from './route/blog.js';
import cookieParser from 'cookie-parser';
import { checkUser } from './middleware/authMiddleware.js';
import BLOG from './model/blog.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to DB');
  })
  .catch((err) => {
    console.log(err.message);
  });
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.get('*', checkUser);
app.get('/', async (req, res) => {
  const allBlogs = await BLOG.find({});
  res.status(200).render('home', {
    blogs: allBlogs,
  });
});
app.use('/auth', auth);
app.use('/blog', blog);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.port || 5000;
app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
