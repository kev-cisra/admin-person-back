import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateSessionToken, hashToken } from '../utils/token';
import { randomUUID } from 'crypto';

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

    // Validar que se proporcionen email y contraseña
    if (!email || !password) {
      return res.status(400).json({ message: 'La contraseña y el email son requeridos' });
    }

    try {
      // Buscar el usuario por email (traer sólo campos necesarios para evitar serializar BigInt)
      // Primero traer solo id y password para verificar la contraseña
      const rawUser = await prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          password: true,
        },
      });
      
      if (!rawUser) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar la contraseña
      const isValidPassword = await verifyPassword(password, rawUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Contraseña inválida' });
      }
      // Obtener safeUser separado (sin id ni password) para devolver al cliente
      const safeUser = await prisma.usuario.findUnique({
        where: { id: rawUser!.id },
        select: {
          uuid: true,
          email: true,
          nombre: true,
        },
      });
      
      // Generar un token de sesión
      const { token, secretHash, expiresAt } = generateSessionToken();

      // Almacenar el token en la base de datos (generar uuid y usar usuario.uuid)
      await prisma.token.create({
        data: {
          uuid: randomUUID(),
          secretHash,
          type: 'session',
          expiresAt,
          usuarioId: rawUser!.id,
        },
      });

      return res.json({
        message: 'Logeo exitoso',
        user: safeUser,
        token: {
          value: token,
          expiresAt: expiresAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('Login error', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
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
        where: { id: parsedUserId },
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
        where: { id: parsedUserId },
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
      const departamentoIdStr =
        typeof departamentoId === 'number'
          ? String(departamentoId)
          : (typeof departamentoId === 'string' && departamentoId.trim() !== '' ? departamentoId : undefined);

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
            departamentoId: departamentoIdStr ?? undefined,
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
