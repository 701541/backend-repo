const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// 🟢 Middleware
app.use(cors());
app.use(express.json());

// 🟢 MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/user-points-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// 🟢 Mongoose Models
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  points: { type: Number, default: 0 },
}));

const ClaimHistory = mongoose.model('ClaimHistory', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  points: Number,
  timestamp: { type: Date, default: Date.now },
}));

// 🟢 API: Claim Points
app.post('/api/claim', async (req, res) => {
  try {
    const { userId } = req.body;
    const randomPoints = Math.floor(Math.random() * 10) + 1;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.points += randomPoints;
    await user.save();

    await ClaimHistory.create({ userId, points: randomPoints });

    res.json({ success: true, randomPoints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🟢 API: Get All Users with Ranking
app.get('/api/users', async (req, res) => {
  const users = await User.find().sort({ points: -1 });
  res.json(users);
});

// 🟢 API: Add New User
app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  const newUser = await User.create({ name });
  res.json(newUser);
});

// 🟢 API: Get Claim History
app.get('/api/history', async (req, res) => {
  const history = await ClaimHistory.find().populate('userId', 'name').sort({ timestamp: -1 });
  res.json(history);
});

// 🟢 Start Server
app.listen(PORT, () => {
  console.log('Server started at http://localhost:${PORT}');
});
