import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { computeNextReview, difficultyToQuality } from '../lib/flashcard';

function extractBracketedWords(content: string): string[] {
  const words: string[] = [];
  for (const m of content.matchAll(/\[([^\]]+)\]/g)) {
    const word = m[1].split('*')[0].trim();
    if (word) words.push(word);
  }
  return [...new Set(words)]; // deduplicate
}

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const paragraphs = await prisma.paragraph.findMany();
    res.json(paragraphs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paragraph = await prisma.paragraph.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!paragraph) return res.status(404).json({ error: 'Paragraph not found.' });
    res.json(paragraph);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { content, sectionId } = req.body;
  try {
    const paragraph = await prisma.paragraph.create({ data: { content, sectionId } });
    res.status(201).json(paragraph);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  const { content } = req.body;
  try {
    const paragraph = await prisma.paragraph.update({
      where: { id: Number(req.params.id) },
      data: { content },
    });
    res.json(paragraph);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/:id/init-blanks', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token.' });
  let userId: number;
  try {
    const payload = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET!) as any;
    userId = payload.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  try {
    const paragraphId = Number(req.params.id);
    const paragraph = await prisma.paragraph.findUnique({ where: { id: paragraphId } });
    if (!paragraph) return res.status(404).json({ error: 'Paragraph not found.' });

    const words = extractBracketedWords(paragraph.content);
    await Promise.all(words.map(word =>
      prisma.blank.upsert({
        where: { userId_paragraphId_word: { userId, paragraphId, word } },
        create: { userId, paragraphId, word },
        update: {},
      })
    ));
    res.json({ initialized: words.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch('/:id/blanks/:word', async (req, res) => {
  console.log('PATCH /paragraph/:id/blanks/:word', req.params, req.body);
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token.' });
  let userId: number;
  try {
    const payload = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET!) as any;
    userId = payload.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  const { difficulty } = req.body;
  if (typeof difficulty !== 'number' || difficulty < 1 || difficulty > 4) {
    return res.status(400).json({ error: 'difficulty must be a number between 1 and 4.' });
  }

  try {
    const existing = await prisma.blank.findUniqueOrThrow({
      where: {
        userId_paragraphId_word: {
          userId,
          paragraphId: Number(req.params.id),
          word: req.params.word,
        },
      },
    });

    const quality = difficultyToQuality(difficulty);
    const sm2 = computeNextReview(quality, existing.easiness, existing.interval, existing.repetitions);

    const blank = await prisma.blank.update({
      where: { id: existing.id },
      data: {
        difficulty,
        easiness: sm2.easiness,
        interval: sm2.interval,
        repetitions: sm2.repetitions,
        nextReviewAt: sm2.nextReviewAt,
      },
    });
    res.json(blank);
  } catch (error) {
    res.status(404).json({ error: 'Blank not found. Make sure init-blanks was called first.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.paragraph.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
