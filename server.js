const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schemas
const UserSchema = new mongoose.Schema({
    name: String,
    points: { type: Number, default: 0 },
});

const HistorySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    pointsClaimed: Number,
    timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const History = mongoose.model('History', HistorySchema);

// Add new user
app.post('/users', async (req, res) => {
    const { name } = req.body;
    const user = new User({ name });
    await user.save();
    res.json(user);
});

// Get all users
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Claim random points
app.post('/claim/:userId', async (req, res) => {
    const { userId } = req.params;
    const points = Math.floor(Math.random() * 10) + 1;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    user.points += points;
    await user.save();

    await History.create({
        userId: user._id,
        userName: user.name,
        pointsClaimed: points,
    });

    res.json({ message: 'Points claimed', points });
});

// Get leaderboard
app.get('/leaderboard', async (req, res) => {
    const users = await User.find().sort({ points: -1 });
    res.json(users);
});

// Get claim history
app.get('/history', async (req, res) => {
    const history = await History.find().sort({ timestamp: -1 });
    res.json(history);
});

// Server start
app.listen(5000, () => console.log('Server started on http://localhost:5000'));
