import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const books = await prisma.book.findMany({ include: { chapters: true } });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: Number(req.params.id) },
      include: { chapters: true },
    });
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  try {
    const book = await prisma.book.create({ data: { title } });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  const { title } = req.body;
  try {
    const book = await prisma.book.update({
      where: { id: Number(req.params.id) },
      data: { title },
    });
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.book.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
