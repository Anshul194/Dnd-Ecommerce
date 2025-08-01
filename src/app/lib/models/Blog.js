
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  images: [
    {
      url: { type: String, required: true },
      alt: { type: String },
    }
  ],
  thumbnail: {
    url: { type: String },
    alt: { type: String },
  },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const getBlogModel = (conn) => {
  return conn.models.Blog || conn.model('Blog', BlogSchema);
};
export default getBlogModel;
