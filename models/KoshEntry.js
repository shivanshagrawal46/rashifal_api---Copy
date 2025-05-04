const mongoose = require('mongoose');

const KoshEntrySchema = new mongoose.Schema({
  id: String,
  title_hi: String,
  title_en: String,
  category_id: String,
  structure: String,
  meaning: String,
  extra: String,
  image: [String],
  lang: String,
  image_only: Boolean,
  video_link: String,
  vishesh: String,
  search: [String],
  monthCat: String    // tag for which Excel month
});

module.exports = mongoose.model('KoshEntry', KoshEntrySchema);  // :contentReference[oaicite:3]{index=3}
