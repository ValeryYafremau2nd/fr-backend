import * as mongoose from 'mongoose';
import validator from 'validator';
import * as bcrypt from 'bcryptjs';
import IUser from '../interfaces/user/user-interface';
import IUserModel from '../interfaces/user/user-model-interface';
import { HookNextFunction } from 'mongoose';

const userSchema = new mongoose.Schema<IUser, IUserModel>({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function (next: HookNextFunction) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre(/^find/, (next: HookNextFunction) => {
  User.find({ active: { $ne: false } });
  next();
});
const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
