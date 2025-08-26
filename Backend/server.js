const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// 🔐 Secret key
const SECRET_KEY = 'my-secret-key';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));

// 🧑 Fake user (password should be hashed)
const users = [
  {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10), // Hashed password
  }
];

// ✅ Login Route (fixed)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1m' });
  const decoded = jwt.decode(token);

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // use true in production with HTTPS
    sameSite: 'Lax',
    maxAge: 3600000,
  });

  res.json({ exp: decoded.exp, message: 'successfully logged-in' });
});

// 🛡️ Protected route
app.get('/dashboard', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: 'Welcome to dashboard', user: decoded });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// 🔁 Refresh Token Route (fixed logic)
app.post('/refresh', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const newToken = jwt.sign({ username: decoded.username }, SECRET_KEY, { expiresIn: '1m' });
    const newDecoded = jwt.decode(newToken);

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 3600000,
    });

    return res.json({ exp: decoded.exp, message: 'successfully refreshed' });
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
});

// 🚪 Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// ✅ Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
