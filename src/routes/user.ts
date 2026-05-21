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
    const { name, password, role } = req.body;
    try {
      console.log('Creating user with name:', name);
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = await prisma.user.create({
        data: { name, password: hashedPassword, role },
      });
      console.log('User created successfully:', newUser);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', (error as Error).message);
      res.status(400).json({ error: (error as Error).message });
    }
  });

router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;