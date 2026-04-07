const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/services', require('./routes/services'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/projects', require('./routes/projects'));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dashboard aggregated data for Admin
app.get('/api/dashboard', async (req, res) => {
  try {
    const User = require('./models/User');
    const Enquiry = require('./models/Enquiry');
    const Quotation = require('./models/Quotation');

    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalEnquiries = await Enquiry.countDocuments();
    const activeQuotations = await Quotation.countDocuments({ status: 'Approved' });
    const pendingQuotations = await Quotation.countDocuments({ status: 'Pending' });

    res.json({
      totalCustomers,
      totalEnquiries,
      activeQuotations,
      pendingQuotations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/steel-dashboard')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
