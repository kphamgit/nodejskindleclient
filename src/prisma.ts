import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const dbUrl = new URL(process.env.DATABASE_URL!);
const isProduction = process.env.NODE_ENV === 'production';

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
