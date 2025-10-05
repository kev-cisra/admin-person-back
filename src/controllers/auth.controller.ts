import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class AuthController {
  static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { password: _password, ...safeUser } = user;

      return res.json({ message: 'Login successful', user: safeUser });
    } catch (error) {
      console.error('Login error', error);
      return res.status(500).json({ message: 'Unable to login' });
    }
  }

  static async logout(_req: Request, res: Response): Promise<Response> {
    return res.json({ message: 'Logout successful' });
  }

  static async updatePassword(req: Request, res: Response): Promise<Response> {
    const { userId, newPassword } = req.body as { userId?: number; newPassword?: string };

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { password: newPassword },
      });

      const { password: _password, ...safeUser } = user;

      return res.json({ message: 'Password updated successfully', user: safeUser });
    } catch (error) {
      console.error('Password update error', error);
      return res.status(500).json({ message: 'Unable to update password' });
    }
  }

  static async updateEmail(req: Request, res: Response): Promise<Response> {
    const { userId, newEmail } = req.body as { userId?: number; newEmail?: string };

    if (!userId || !newEmail) {
      return res.status(400).json({ message: 'User ID and new email are required' });
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { email: newEmail },
      });

      const { password: _password, ...safeUser } = user;

      return res.json({ message: 'Email updated successfully', user: safeUser });
    } catch (error) {
      console.error('Email update error', error);
      return res.status(500).json({ message: 'Unable to update email' });
    }
  }
}
