import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed for usuarios, departamentos y personal...');

  await prisma.proyectoPersonal.deleteMany();
  await prisma.personal.deleteMany();
  await prisma.proyecto.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.departamento.deleteMany();

  const departamentos = await Promise.all([
    prisma.departamento.create({
      data: {
        nombre: 'Recursos Humanos',
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Tecnología de la Información',
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Finanzas',
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

  await Promise.all([
    prisma.usuario.create({
      data: {
        email: 'admin@empresa.com',
        // Contraseña original: Admin#123 (cifrada con scrypt)
        password: adminPassword,
        nombre: 'Administrador General',
      },
    }),
    prisma.usuario.create({
      data: {
        email: 'juan.perez@empresa.com',
        // Contraseña original: Usuario#123 (cifrada con scrypt)
        password: juanPassword,
        nombre: 'Juan Pérez',
      },
    }),
    prisma.usuario.create({
      data: {
        email: 'maria.garcia@empresa.com',
        // Contraseña original: Usuario#123 (cifrada con scrypt)
        password: mariaPassword,
        nombre: 'María García',
      },
    }),
  ]);

  const departamentoMap = new Map(
    departamentos.map((departamento) => [departamento.nombre, departamento] as const),
  );

  await Promise.all([
    prisma.personal.create({
      data: {
        nombre: 'Juan Pérez',
        telefono: '555-0101',
        fechaNacimiento: new Date('1985-03-10'),
        fechaIngreso: new Date('2020-01-15'),
        usuario: {
          connect: { email: 'juan.perez@empresa.com' },
        },
        departamento: {
          connect: { uuid: departamentoMap.get('Tecnología de la Información')!.uuid },
        },
      },
    }),
    prisma.personal.create({
      data: {
        nombre: 'María García',
        telefono: '555-0102',
        fechaNacimiento: new Date('1990-07-22'),
        fechaIngreso: new Date('2021-05-01'),
        usuario: {
          connect: { email: 'maria.garcia@empresa.com' },
        },
        departamento: {
          connect: { uuid: departamentoMap.get('Finanzas')!.uuid },
        },
      },
    }),
    prisma.personal.create({
      data: {
        nombre: 'Carlos López',
        telefono: '555-0103',
        fechaNacimiento: new Date('1988-11-05'),
        fechaIngreso: new Date('2019-09-10'),
        departamento: {
          connect: { uuid: departamentoMap.get('Recursos Humanos')!.uuid },
        },
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
