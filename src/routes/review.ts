import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const router = Router();


router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token.' });
  let userId: number;
  try {
    const payload = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET!) as any;
    userId = payload.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  const bookId = req.query.bookId ? Number(req.query.bookId) : undefined;

  try {
    const allBlanks = await prisma.blank.findMany({ where: { userId } });
    console.log('[review] all blanks for user', userId, JSON.stringify(allBlanks.map(b => ({ id: b.id, word: b.word, nextReviewAt: b.nextReviewAt, paragraphId: b.paragraphId }))));
    console.log('[review] now =', new Date(), 'bookId =', bookId);

    const blanks = await prisma.blank.findMany({
      where: {
        userId,
        OR: [
          { nextReviewAt: null },
          { nextReviewAt: { lte: new Date() } },
        ],
        ...(bookId ? { paragraph: { section: { chapter: { bookId } } } } : {}),
      },
      include: { paragraph: true },
    });
    console.log('[review] due blanks count:', blanks.length);

    // Group due blanks by paragraph
    const paragraphMap = new Map<number, { paragraphId: number; content: string; dueWords: string[] }>();
    for (const b of blanks) {
      if (!paragraphMap.has(b.paragraphId)) {
        paragraphMap.set(b.paragraphId, { paragraphId: b.paragraphId, content: b.paragraph.content, dueWords: [] });
      }
      paragraphMap.get(b.paragraphId)!.dueWords.push(b.word);
    }

    const result = Array.from(paragraphMap.values());

    // Attach nextReviewAt per word from the blanks list
    const blankMap = new Map(blanks.map(b => [b.word, b.nextReviewAt]));
    for (const p of result) {
      (p as any).dueWordDetails = p.dueWords.map(w => ({
        word: w,
        nextReviewAt: blankMap.get(w) ?? null,
      }));
    }

    // Find the earliest future nextReviewAt for this user/book
    const nextBlank = await prisma.blank.findFirst({
      where: {
        userId,
        nextReviewAt: { gt: new Date() },
        ...(bookId ? { paragraph: { section: { chapter: { bookId } } } } : {}),
      },
      orderBy: { nextReviewAt: 'asc' },
    });

    res.json({ paragraphs: result, nextDue: nextBlank?.nextReviewAt ?? null });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/reset', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token.' });
  let userId: number;
  try {
    const payload = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET!) as any;
    userId = payload.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  const bookId = req.body.bookId ? Number(req.body.bookId) : undefined;

  try {
    await prisma.blank.updateMany({
      where: {
        userId,
        ...(bookId ? { paragraph: { section: { chapter: { bookId } } } } : {}),
      },
      data: { nextReviewAt: null },
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
