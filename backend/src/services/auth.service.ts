import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const sign = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

export const signupUser = async (name: string, email: string, password: string) => {
  if (await User.findOne({ email })) throw new Error('Email already registered');
  const user = await User.create({ name, email, password });
  return { token: sign(user._id.toString(), user.role), user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) throw new Error('Invalid email or password');
  return { token: sign(user._id.toString(), user.role), user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};
