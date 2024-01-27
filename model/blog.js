import mongoose from 'mongoose';
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    body: {
      type: String,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: false,
      default: '/images/defaultBlog.png',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const BLOG = mongoose.model('Blog', blogSchema);

export default BLOG;
