const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me - current logged-in user's profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

// PUT /api/users/me - update bio / skills
router.put('/me', auth, async (req, res) => {
  const { bio, skillsTeach, skillsWant, name } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (bio !== undefined) update.bio = bio;
  if (skillsTeach !== undefined) update.skillsTeach = skillsTeach;
  if (skillsWant !== undefined) update.skillsWant = skillsWant;

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
  res.json(user);
});

// GET /api/users - browse other users, optional ?skill=xyz search
router.get('/', auth, async (req, res) => {
  const { skill } = req.query;
  const filter = { _id: { $ne: req.userId } };

  if (skill) {
    const regex = new RegExp(skill, 'i');
    filter.$or = [{ skillsTeach: regex }, { skillsWant: regex }];
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// GET /api/users/:id - view a single user's public profile
router.get('/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

module.exports = router;
