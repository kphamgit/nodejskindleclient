import { Router } from 'express';
import prisma from '../prisma';

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

router.delete('/:id', async (req, res) => {
  try {
    await prisma.paragraph.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
