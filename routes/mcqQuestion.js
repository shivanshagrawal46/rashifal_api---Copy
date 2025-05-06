const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const MCQQuestion = require('../models/mcqQuestion');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  }
});

// Upload MCQ questions from Excel file
router.post('/upload', upload.single('mcqFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate required columns
    const requiredColumns = ['id', 'question', 'option1', 'option2', 'option3', 'option4', 'correct_option'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        message: `Missing required columns: ${missingColumns.join(', ')}` 
      });
    }

    // Get the next available ID
    const lastQuestion = await MCQQuestion.findOne().sort({ id: -1 });
    let nextId = lastQuestion ? lastQuestion.id + 1 : 1;

    // Process each row
    const questions = data.map(row => ({
      id: nextId++,
      subcategory_id: parseInt(req.body.subcategoryId),
      question: row.question,
      option1: row.option1,
      option2: row.option2,
      option3: row.option3,
      option4: row.option4,
      correct_option: parseInt(row.correct_option)
    }));

    // Insert all questions
    await MCQQuestion.insertMany(questions);

    res.json({ 
      message: 'MCQ questions uploaded successfully',
      count: questions.length
    });
  } catch (error) {
    console.error('Error uploading MCQ questions:', error);
    res.status(500).json({ 
      message: 'Error uploading MCQ questions',
      error: error.message 
    });
  }
});

// Get all questions for a subcategory
router.get('/subcategory/:subcategoryId', async (req, res) => {
  try {
    const questions = await MCQQuestion.find({ 
      subcategory_id: parseInt(req.params.subcategoryId) 
    }).sort({ id: 1 });
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching MCQ questions',
      error: error.message 
    });
  }
});

// Delete a question
router.delete('/:id', async (req, res) => {
  try {
    const question = await MCQQuestion.findOneAndDelete({ 
      id: parseInt(req.params.id) 
    });
    
    if (!question) {
      return res.status(404).json({ 
        status: false,
        message: 'Question not found' 
      });
    }
    
    res.json({ 
      status: true,
      message: 'Question deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: false,
      message: 'Error deleting question',
      error: error.message 
    });
  }
});

// Update a question
router.put('/:id', async (req, res) => {
  try {
    const { question, option1, option2, option3, option4, correct_option } = req.body;
    
    const updatedQuestion = await MCQQuestion.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { 
        question,
        option1,
        option2,
        option3,
        option4,
        correct_option: parseInt(correct_option)
      },
      { new: true }
    );
    
    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating question',
      error: error.message 
    });
  }
});

module.exports = router; 