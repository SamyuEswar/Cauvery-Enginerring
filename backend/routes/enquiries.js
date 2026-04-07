const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const Notification = require('../models/Notification'); // We could use this to notify admin

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    let query = {};
    if (userId) query.userId = userId;
    const enquiries = await Enquiry.find(query).populate('userId', 'name email').sort({ date: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    
    // Also broadcast a notification for admins
    await Notification.create({
      type: 'enquiry',
      title: 'New Enquiry Received',
      message: `${enquiry.name} sent a new query.`,
    });

    res.status(201).json(enquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
