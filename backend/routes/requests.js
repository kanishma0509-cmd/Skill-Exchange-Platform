const express = require('express');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/requests - send a new exchange request
router.post('/', auth, async (req, res) => {
  try {
    const { toUser, skillOffered, skillWanted, message } = req.body;
    if (!toUser || !skillOffered || !skillWanted) {
      return res.status(400).json({ error: 'toUser, skillOffered, and skillWanted are required.' });
    }
    if (toUser === req.userId) {
      return res.status(400).json({ error: "You can't send a request to yourself." });
    }

    const request = await Request.create({
      fromUser: req.userId,
      toUser,
      skillOffered,
      skillWanted,
      message: message || ''
    });
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send the request.' });
  }
});

// GET /api/requests - all requests involving the current user (sent + received)
router.get('/', auth, async (req, res) => {
  const requests = await Request.find({
    $or: [{ fromUser: req.userId }, { toUser: req.userId }]
  })
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .sort({ createdAt: -1 });
  res.json(requests);
});

// PUT /api/requests/:id - accept / reject / complete a request (only the recipient can accept/reject)
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['accepted', 'rejected', 'completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Status must be accepted, rejected, or completed.' });
  }

  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const isRecipient = request.toUser.toString() === req.userId;
  const isSender = request.fromUser.toString() === req.userId;
  if (!isRecipient && !isSender) {
    return res.status(403).json({ error: "This isn't your request to update." });
  }
  if ((status === 'accepted' || status === 'rejected') && !isRecipient) {
    return res.status(403).json({ error: 'Only the recipient can accept or reject a request.' });
  }

  request.status = status;
  await request.save();
  res.json(request);
});

module.exports = router;
