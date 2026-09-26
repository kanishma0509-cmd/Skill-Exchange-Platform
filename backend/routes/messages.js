const express = require('express');
const Message = require('../models/Message');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

const router = express.Router();

async function assertParticipant(requestId, userId) {
  const request = await Request.findById(requestId);
  if (!request) return null;
  const isParticipant = request.fromUser.toString() === userId || request.toUser.toString() === userId;
  return isParticipant ? request : false;
}

// GET /api/messages/:requestId - full conversation for a request
router.get('/:requestId', auth, async (req, res) => {
  const check = await assertParticipant(req.params.requestId, req.userId);
  if (check === null) return res.status(404).json({ error: 'Request not found.' });
  if (check === false) return res.status(403).json({ error: "This isn't your conversation." });

  const messages = await Message.find({ requestId: req.params.requestId })
    .populate('sender', 'name')
    .sort({ createdAt: 1 });
  res.json(messages);
});

// POST /api/messages - send a message tied to a request
router.post('/', auth, async (req, res) => {
  const { requestId, text } = req.body;
  if (!requestId || !text) {
    return res.status(400).json({ error: 'requestId and text are required.' });
  }

  const check = await assertParticipant(requestId, req.userId);
  if (check === null) return res.status(404).json({ error: 'Request not found.' });
  if (check === false) return res.status(403).json({ error: "This isn't your conversation." });

  const message = await Message.create({ requestId, sender: req.userId, text });
  const populated = await message.populate('sender', 'name');
  res.status(201).json(populated);
});

module.exports = router;
