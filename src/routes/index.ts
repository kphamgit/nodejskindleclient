import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/definitions', async (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: 'Word is required.' });
  try {
    const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!r.ok) return res.status(404).json({ error: `No definition found for "${word}".` });
    const data = await r.json() as any[];
    const meanings = data[0]?.meanings ?? [];
    const meaning = req.body.partOfSpeech
      ? (meanings.find((m: any) => m.partOfSpeech === req.body.partOfSpeech) ?? meanings[0])
      : meanings[0];
    const partOfSpeech = meaning?.partOfSpeech ?? '';
    const definitions = (meaning?.definitions ?? []).map((d: any) => d.definition).filter(Boolean);
    res.json({ word, partOfSpeech, definitions });
  } catch {
    res.status(500).json({ error: 'Failed to fetch definition.' });
  }
});

router.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from the server!', timestamp: new Date() });
});

export default router;