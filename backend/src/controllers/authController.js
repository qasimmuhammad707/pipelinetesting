import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const user = await User.create({
      name,
      email,
      password,
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email avatarColor role');
    res.json(users);
  } catch (err) {
    next(err);
  }
};
