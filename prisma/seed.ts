import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed for usuarios, departamentos y personal...');

  await prisma.proyectopersonal.deleteMany();
  await prisma.personal.deleteMany();
  await prisma.proyecto.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.departamento.deleteMany();

  const departamentos = await Promise.all([
    prisma.departamento.create({
      data: {
        nombre: 'Recursos Humanos',
        updatedAt: new Date(),
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Tecnología de la Información',
        updatedAt: new Date(),
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Finanzas',
        updatedAt: new Date(),
      },
    }),
  ]);

  const [
    adminPassword,
    juanPassword,
    mariaPassword,
  ] = await Promise.all([
    hashPassword('Admin#123'),
    hashPassword('Usuario#123'),
    hashPassword('Usuario#123'),
  ]);

  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        email: 'admin@empresa.com',
        // Contraseña original: Admin#123 (cifrada con scrypt)
        password: adminPassword,
        nombre: 'Administrador General',
        updatedAt: new Date(),
      },
    }),
    prisma.usuario.create({
      data: {
        email: 'juan.perez@empresa.com',
        // Contraseña original: Usuario#123 (cifrada con scrypt)
        password: juanPassword,
        nombre: 'Juan Pérez',
        updatedAt: new Date(),
      },
    }),
    prisma.usuario.create({
      data: {
        email: 'maria.garcia@empresa.com',
        // Contraseña original: Usuario#123 (cifrada con scrypt)
        password: mariaPassword,
        nombre: 'María García',
        updatedAt: new Date(),
      },
    }),
  ]);

  const departamentoMap = new Map(
    departamentos.map((departamento) => [departamento.nombre, departamento] as const),
  );

  const usuarioMap = new Map(usuarios.map((u) => [u.email, u] as const));

  await Promise.all([
    prisma.personal.create({
      data: {
        nombre: 'Juan Pérez',
        telefono: '555-0101',
        fechaNacimiento: new Date('1985-03-10'),
        fechaIngreso: new Date('2020-01-15'),
        usuarioId: usuarioMap.get('juan.perez@empresa.com')!.uuid,
        departamentoId: departamentoMap.get('Tecnología de la Información')!.uuid,
        updatedAt: new Date(),
      },
    }),
    prisma.personal.create({
      data: {
        nombre: 'María García',
        telefono: '555-0102',
        fechaNacimiento: new Date('1990-07-22'),
        fechaIngreso: new Date('2021-05-01'),
        usuarioId: usuarioMap.get('maria.garcia@empresa.com')!.uuid,
        departamentoId: departamentoMap.get('Finanzas')!.uuid,
        updatedAt: new Date(),
      },
    }),
    prisma.personal.create({
      data: {
        nombre: 'Carlos López',
        telefono: '555-0103',
        fechaNacimiento: new Date('1988-11-05'),
        fechaIngreso: new Date('2019-09-10'),
        departamentoId: departamentoMap.get('Recursos Humanos')!.uuid,
        updatedAt: new Date(),
      },
    }),
  ]);

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
