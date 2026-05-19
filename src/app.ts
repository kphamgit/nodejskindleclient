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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use(routes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
