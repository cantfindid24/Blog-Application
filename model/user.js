import mongoose from 'mongoose';
import pkg from 'validator';
const { isEmail } = pkg;
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please enter your name'] },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please enter an email'],
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minLength: [6, 'Minimum password length is 6 characters'],
    },
    profileImageURL: {
      type: String,
      default: '/images/default.png',
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
  },
  { timestamps: true }
);

//mongoose hook: fires a function before the doc is saved
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  console.log('user about to be created and saved', this);
  next();
});
//mongoose hook: fires a function after the doc is saved to db
userSchema.post('save', function (doc, next) {
  console.log('new user is  created and saved', doc);
  next();
});
const USER = mongoose.model('User', userSchema);

export default USER;
