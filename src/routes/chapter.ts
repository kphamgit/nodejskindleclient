import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({ include: { sections: true } });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: Number(req.params.id) },
      include: { sections: true },
    });
    if (!chapter) return res.status(404).json({ error: 'Chapter not found.' });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { title, bookId } = req.body;
  try {
    const chapter = await prisma.chapter.create({ data: { title, bookId } });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  const { title } = req.body;
  try {
    const chapter = await prisma.chapter.update({
      where: { id: Number(req.params.id) },
      data: { title },
    });
    res.json(chapter);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.chapter.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
