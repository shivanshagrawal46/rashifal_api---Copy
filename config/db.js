const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)               // connect with SRV string directly :contentReference[oaicite:2]{index=2}
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));

module.exports = mongoose;
