require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test route to get all users from JawsDB
//http://localhost:3000/users
app.get('/users', async (req, res) => {
    console.log('Received request to fetch users');
  try {
    console.log('Fetching users from database...');
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('No users found in the database.');
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test route to create a new user
app.post('/users', async (req, res) => {
  console.log('Received request to create user:', req.body);
  const { email, name } = req.body;
  try {
    console.log('Creating user with email:', email);
    const newUser = await prisma.user.create({
      data: { email, name },
    });
    console.log('User created successfully:', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});