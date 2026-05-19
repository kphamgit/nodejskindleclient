import { Router } from 'express';
import userRouter from './user';


const router = Router();
router.use('/users', userRouter);
router.use('/login', userRouter);

router.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from the server!', timestamp: new Date() });
});

export default router;