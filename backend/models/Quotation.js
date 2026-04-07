const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quotationId: { type: String, required: true, unique: true }, // e.g., QT-001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: { type: String, required: true },
  service: { type: String, required: true },
  material: { type: Number, required: true },
  labor: { type: Number, required: true },
  gst: { type: Number, required: true },
  total: { type: Number, required: true },
  validity: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
