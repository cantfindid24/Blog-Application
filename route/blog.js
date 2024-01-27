import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import Blog from '../model/blog.js';
import Comment from '../model/comment.js';
import isUserAuthenticated, {
  checkUser,
} from '../middleware/authMiddleware.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get('/add-new', (req, res) => {
  return res.render('addBlog.ejs');
});

router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('createdBy');
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    'createdBy'
  );
  console.log(comments);
  return res.render('blog.ejs', { blog, comments });
});

router.post(
  '/comment/:blogId',
  isUserAuthenticated,
  checkUser,
  async (req, res) => {
    const comment = await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: res.locals.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  }
);

router.post('/', checkUser, upload.single('coverImage'), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    createdBy: res.locals.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});
export default router;
