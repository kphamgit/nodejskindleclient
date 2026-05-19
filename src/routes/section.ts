import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const section = await prisma.section.findUnique({
      where: { id: Number(req.params.id) },
      include: { paragraphs: true },
    });
    if (!section) return res.status(404).json({ error: 'Section not found.' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { title, chapterId } = req.body;
  try {
    const section = await prisma.section.create({ data: { title, chapterId } });
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  const { title } = req.body;
  try {
    const section = await prisma.section.update({
      where: { id: Number(req.params.id) },
      data: { title },
    });
    res.json(section);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.section.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
