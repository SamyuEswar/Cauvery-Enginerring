const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    let query = {};
    if (userId) query.userId = userId;
    const quotations = await Quotation.find(query).sort({ date: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const count = await Quotation.countDocuments();
    const qid = `QT-${(count + 1).toString().padStart(3, '0')}`;
    const quotation = new Quotation({ ...req.body, quotationId: qid });
    await quotation.save();

    if (quotation.userId) {
      await Notification.create({
        userId: quotation.userId,
        type: 'quotation',
        title: 'New Quotation Received',
        message: `Quotation ${qid} has been sent to you.`,
      });
    }

    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Notify admin if user approves/rejects
    if (req.body.status === 'Approved' || req.body.status === 'Rejected') {
      await Notification.create({
        type: 'quotation',
        title: `Quotation ${req.body.status}`,
        message: `${quotation.quotationId} ${req.body.status.toLowerCase()} by ${quotation.customer}.`,
      });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
