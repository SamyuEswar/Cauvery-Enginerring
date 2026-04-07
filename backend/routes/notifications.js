const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    let query = {};
    if (userId) {
      query.userId = userId;
    } else {
      query.userId = { $exists: false }; // admin/broadcast
    }
    const notifications = await Notification.find(query).sort({ time: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/mark-all', async (req, res) => {
  try {
    const userId = req.body.userId;
    let query = {};
    if (userId) query.userId = userId;
    else query.userId = { $exists: false };
    
    await Notification.updateMany(query, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === 'all') {
      const userId = req.query.userId;
      let query = {};
      if (userId) query.userId = userId;
      else query.userId = { $exists: false };
      await Notification.deleteMany(query);
      return res.json({ message: 'All notifications cleared' });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
