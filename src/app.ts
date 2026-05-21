import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import routes from './routes';
import prisma from './prisma';

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', (err as Error).message));

const app = express();

function requireRole(role: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET!) as any;
      if (payload.role !== role) return res.redirect('/');
      next();
    } catch {
      res.redirect('/');
    }
  };
}

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/student', requireRole('student'), express.static(path.join(process.cwd(), 'public-student')));
app.use('/teacher', requireRole('teacher'), express.static(path.join(process.cwd(), 'public-teacher')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public-student', 'index.html'));
});

app.use(routes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
