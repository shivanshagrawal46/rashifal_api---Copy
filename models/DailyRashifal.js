const mongoose = require('mongoose');

const dailyRashifalSchema = new mongoose.Schema({

  id: {
    type: String,
    required: true
  },                                                
  title_hn: {
    type: String,
    required: true
  },
  title_en: {
    type: String,
    required: true
  },
  date_rashifal:{
    type: String,
    required: true
  },
  details_hn: {
    type: String,
    required: true
  },
  details_en: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DailyRashifal', dailyRashifalSchema); 