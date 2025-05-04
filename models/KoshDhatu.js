const mongoose = require('mongoose');

const koshDhatuSchema = new mongoose.Schema({
  id: { type: String, default: '' },
  title_hn: { type: String, default: '' },
  title_en: { type: String, default: '' },
  title_sn: { type: String, default: '' },
  meaning: { type: String, default: '' },
  structure: { type: String, default: '' },
  search: { type: String, default: '' },
  image: { type: String, default: '' },
  vishesh: { type: String, default: '' },
  date_rashifal: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('KoshDhatu', koshDhatuSchema); 