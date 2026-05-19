import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';

const SALT_ROUNDS = 10;

const router = Router();

router.get('/', async (_req, res) => {
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

router.post('/', async (req, res) => {
    console.log('Received request to create user:', req.body);
    const { name, password } = req.body;
    try {
      console.log('Creating user with name:', name);
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = await prisma.user.create({
        data: { name, password: hashedPassword },
      });
      console.log('User created successfully:', newUser);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', (error as Error).message);
      res.status(400).json({ error: (error as Error).message });
    }
  });

router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { name } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid name or password.' });
    }
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;