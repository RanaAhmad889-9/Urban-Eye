import { Request, Response } from 'express';
import { signupUser, loginUser } from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    return res.status(201).json(await signupUser(name, email, password));
  } catch (e: unknown) {
    return res.status(400).json({ message: (e as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    return res.status(200).json(await loginUser(email, password));
  } catch (e: unknown) {
    return res.status(401).json({ message: (e as Error).message });
  }
};
