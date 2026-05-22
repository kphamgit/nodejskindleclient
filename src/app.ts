import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import routes from './routes';
import prisma from './prisma';

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', (err as Error).message));

const app = express();

function isKindle(req: express.Request): boolean {
  const ua = req.headers['user-agent'] || '';
  return /kindle/i.test(ua);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/student', express.static(path.join(process.cwd(), 'public-student')));
app.use('/teacher', express.static(path.join(process.cwd(), 'public-teacher')));

app.get('/', (req, res) => {
  if (isKindle(req)) {
    res.sendFile(path.join(process.cwd(), 'public-student', 'kindle-index.html'));
  } else {
    res.sendFile(path.join(process.cwd(), 'public-student', 'index.html'));
  }
});

app.use(routes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
