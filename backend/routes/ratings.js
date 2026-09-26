const express = require('express');
const Rating = require('../models/Rating');
const Request = require('../models/Request');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/ratings - rate the other person after a completed/accepted exchange
router.post('/', auth, async (req, res) => {
  try {
    const { requestId, stars, comment } = req.body;
    if (!requestId || !stars) {
      return res.status(400).json({ error: 'requestId and stars are required.' });
    }

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const isSender = request.fromUser.toString() === req.userId;
    const isRecipient = request.toUser.toString() === req.userId;
    if (!isSender && !isRecipient) {
      return res.status(403).json({ error: "This isn't your exchange to rate." });
    }

    const toUser = isSender ? request.toUser : request.fromUser;

    const rating = await Rating.create({
      requestId,
      fromUser: req.userId,
      toUser,
      stars,
      comment: comment || ''
    });

    // Recalculate the recipient's average rating
    const allRatings = await Rating.find({ toUser });
    const avg = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;
    await User.findByIdAndUpdate(toUser, {
      ratingAvg: Math.round(avg * 10) / 10,
      ratingCount: allRatings.length
    });

    res.status(201).json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit the rating.' });
  }
});

// GET /api/ratings/:userId - all ratings received by a user
router.get('/:userId', auth, async (req, res) => {
  const ratings = await Rating.find({ toUser: req.params.userId })
    .populate('fromUser', 'name')
    .sort({ createdAt: -1 });
  res.json(ratings);
});

module.exports = router;
