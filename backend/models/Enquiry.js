const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  adminReply: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['New', 'Replied', 'Closed'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
