import { Request, Response } from 'express';
import User from '../models/user.model';
import Image from '../models/image.model';

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch { return res.status(500).json({ message: 'Failed' }); }
};

export const getAllImages = async (_req: Request, res: Response) => {
  try {
    const images = await Image.find().populate('userId', 'name email').sort({ createdAt: -1 });
    return res.json({ images });
  } catch { return res.status(500).json({ message: 'Failed' }); }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted' });
  } catch { return res.status(500).json({ message: 'Failed' }); }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Image.deleteMany({ userId: req.params.id });
    return res.json({ message: 'User and data deleted' });
  } catch { return res.status(500).json({ message: 'Failed' }); }
};
