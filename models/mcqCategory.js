const mongoose = require('mongoose');

const mcqCategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  category_name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create a compound index for id and category_name
mcqCategorySchema.index({ id: 1, category_name: 1 }, { unique: true });

const MCQCategory = mongoose.model('MCQCategory', mcqCategorySchema);

module.exports = MCQCategory; 