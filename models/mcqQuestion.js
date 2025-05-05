const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  subcategory_id: {
    type: Number,
    required: true,
    ref: 'MCQSubcategory'
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  option1: {
    type: String,
    required: true,
    trim: true
  },
  option2: {
    type: String,
    required: true,
    trim: true
  },
  option3: {
    type: String,
    required: true,
    trim: true
  },
  option4: {
    type: String,
    required: true,
    trim: true
  },
  correct_option: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const MCQQuestion = mongoose.model('MCQQuestion', mcqQuestionSchema);

module.exports = MCQQuestion; 