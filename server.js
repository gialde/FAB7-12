const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());
const PORT = 3000;

// Хранилища (в памяти)
const users = [];
const products = [];

// РЕГИСТРАЦИЯ
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    passwordHash: hashedPassword
  };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

// ЛОГИН (без JWT пока, только проверка)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', userId: user.id });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});