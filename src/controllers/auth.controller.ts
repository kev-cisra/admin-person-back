import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateSessionToken, hashToken } from '../utils/token';

function parseUuid(value: unknown): bigint | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return BigInt(value);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    try {
      return BigInt(value);
    } catch (error) {
      console.error('Invalid bigint string received', { value, error });
      return null;
    }
  }

  return null;
}

function parseDateValue(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export class AuthController {
  static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await prisma.usuario.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { password: _password, ...safeUser } = user;

      const { token, secretHash, expiresAt } = generateSessionToken();

      await prisma.token.create({
        data: {
          secretHash,
          type: 'session',
          expiresAt,
          usuarioId: user.uuid,
        },
      });

      return res.json({
        message: 'Login successful',
        user: safeUser,
        token: {
          value: token,
          expiresAt: expiresAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('Login error', error);
      return res.status(500).json({ message: 'Unable to login' });
    }
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    const { token } = req.body as { token?: string };

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    try {
      const secretHash = hashToken(token);
      const result = await prisma.token.updateMany({
        where: { secretHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (result.count === 0) {
        return res.status(404).json({ message: 'Token not found or already revoked' });
      }

      return res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error', error);
      return res.status(500).json({ message: 'Unable to logout' });
    }
  }

  static async updatePassword(req: Request, res: Response): Promise<Response> {
    const { userId, newPassword } = req.body as { userId?: number | string; newPassword?: string };

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }

    const parsedUserId = parseUuid(userId);

    if (parsedUserId === null) {
      return res.status(400).json({ message: 'Invalid user ID provided' });
    }

    try {
      const hashedPassword = await hashPassword(newPassword);
      const user = await prisma.usuario.update({
        where: { uuid: parsedUserId },
        data: { password: hashedPassword },
      });

      const { password: _password, ...safeUser } = user;

      return res.json({ message: 'Password updated successfully', user: safeUser });
    } catch (error) {
      console.error('Password update error', error);
      return res.status(500).json({ message: 'Unable to update password' });
    }
  }

  static async updateEmail(req: Request, res: Response): Promise<Response> {
    const { userId, newEmail } = req.body as { userId?: number | string; newEmail?: string };

    if (!userId || !newEmail) {
      return res.status(400).json({ message: 'User ID and new email are required' });
    }

    const parsedUserId = parseUuid(userId);

    if (parsedUserId === null) {
      return res.status(400).json({ message: 'Invalid user ID provided' });
    }

    try {
      const user = await prisma.usuario.update({
        where: { uuid: parsedUserId },
        data: { email: newEmail },
      });

      const { password: _password, ...safeUser } = user;

      return res.json({ message: 'Email updated successfully', user: safeUser });
    } catch (error) {
      console.error('Email update error', error);
      return res.status(500).json({ message: 'Unable to update email' });
    }
  }

  static async registerPersonal(req: Request, res: Response): Promise<Response> {
    const {
      email,
      password,
      usuarioNombre,
      personalNombre,
      telefono,
      fechaNacimiento,
      fechaIngreso,
      departamentoId,
    } = req.body as {
      email?: string;
      password?: string;
      usuarioNombre?: string;
      personalNombre?: string;
      telefono?: string;
      fechaNacimiento?: string;
      fechaIngreso?: string;
      departamentoId?: number | string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const hashedPassword = await hashPassword(password);
      const departamentoUuid = parseUuid(departamentoId ?? null);

      const result = await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: {
            email,
            password: hashedPassword,
            nombre: usuarioNombre ?? personalNombre ?? null,
            updatedAt: new Date(),
          },
        });

        const personal = await tx.personal.create({
          data: {
            nombre: personalNombre ?? usuarioNombre ?? 'Sin nombre',
            telefono: telefono ?? null,
            fechaNacimiento: parseDateValue(fechaNacimiento),
            fechaIngreso: parseDateValue(fechaIngreso),
            usuarioId: usuario.uuid,
            departamentoId: departamentoUuid ?? undefined,
            updatedAt: new Date(),
          },
        });

        return { usuario, personal };
      });

      const { password: _password, ...safeUsuario } = result.usuario;

      return res.status(201).json({
        message: 'Usuario y personal creados correctamente',
        usuario: safeUsuario,
        personal: result.personal,
      });
    } catch (error) {
      console.error('Error al registrar usuario y personal', error);
      return res.status(500).json({ message: 'Unable to register user and personal' });
    }
  }
}
