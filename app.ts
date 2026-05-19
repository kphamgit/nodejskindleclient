import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import routes from './routes';
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

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', (err as Error).message));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use('/', routes);

app.get('/users', async (_req, res) => {
  console.log('Received request to fetch users');
  try {
    console.log('Fetching users from database...');
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('No users found in the database.');
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/users', async (req, res) => {
  console.log('Received request to create user:', req.body);
  const { email, name } = req.body;
  try {
    console.log('Creating user with email:', email);
    const newUser = await prisma.user.create({
      data: { email, name },
    });
    console.log('User created successfully:', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', (error as Error).message);
    res.status(400).json({ error: (error as Error).message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
