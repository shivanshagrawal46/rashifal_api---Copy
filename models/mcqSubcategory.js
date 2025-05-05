const mongoose = require('mongoose');

const mcqSubcategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  category_id: {
    type: Number,
    required: true,
    ref: 'MCQCategory'
  },
  subcategory_name: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const MCQSubcategory = mongoose.model('MCQSubcategory', mcqSubcategorySchema);

module.exports = MCQSubcategory; 