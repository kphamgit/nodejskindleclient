import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import userRouter from './user';
import bookRouter from './book';
import chapterRouter from './chapter';
import paragraphRouter from './paragraph';
import sectionRouter from './section';

const router = Router();
router.use('/users', userRouter);
router.use('/books', bookRouter);
router.use('/chapters', chapterRouter);
router.use('/paragraphs', paragraphRouter);
router.use('/sections', sectionRouter);

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

router.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from the server!', timestamp: new Date() });
});

export default router;