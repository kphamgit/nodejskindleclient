import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import userRouter from './user';
import bookRouter from './book';
import chapterRouter from './chapter';
import paragraphRouter from './paragraph';
import sectionRouter from './section';
import reviewRouter from './review';

const router = Router();
router.use('/users', userRouter);
router.use('/books', bookRouter);
router.use('/chapters', chapterRouter);
router.use('/paragraphs', paragraphRouter);
router.use('/sections', sectionRouter);
router.use('/review', reviewRouter);

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
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });
    const redirect = user.role === 'teacher' ? '/teacher/dashboard.html' : '/student/dashboard.html';
    res.json({ token, redirect });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Kindle PaperWhite: form POST, server-side redirect, token in readable cookie
router.post('/login-kindle', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.redirect('/?error=missing');
  try {
    const user = await prisma.user.findFirst({ where: { name } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/?error=invalid');
    }
    if (user.role === 'teacher') {
      return res.redirect('/?error=teacher');
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );
    res.cookie('token', token, {
      httpOnly: false,
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });
    // Use meta-refresh instead of HTTP redirect: old WebKit (Kindle) may re-POST on 302,
    // which the static file middleware ignores, causing the redirect to fall through.
    res.send(`<!DOCTYPE html><html><head>
<meta http-equiv="refresh" content="0;url=/student/kindle-dashboard.html">
</head><body><a href="/student/kindle-dashboard.html">Loading...</a></body></html>`);
  } catch (error) {
    res.redirect('/?error=server');
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