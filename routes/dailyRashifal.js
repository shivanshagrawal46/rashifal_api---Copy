const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const DailyRashifal = require('../models/DailyRashifal');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Handle Excel file upload
router.post('/daily-upload', upload.single('dailyFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: 'No file uploaded'
      });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate data structure
    const isValidData = data.every(row => 
      row.id && row.title_hn && row.title_en && row.date_rashifal && row.details_hn && row.details_en
    );

    if (!isValidData) {
      return res.status(400).json({
        status: false,
        message: 'Invalid Excel format. Required columns: title_hn, title_en, details_hn, details_en'
      });
    }

    // Save to database
    await DailyRashifal.deleteMany({}); // Clear existing entries
    const savedEntries = await DailyRashifal.insertMany(data);

    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);

    res.json({
      status: true,
      message: 'Daily rashifal data uploaded successfully',
      details: {
        saved: savedEntries.length,
        errors: 0
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: false,
      message: 'Error processing file: ' + error.message
    });
  }
});

// Get current daily rashifal data
router.get('/dailyrashifalcurrent', async (req, res) => {
  try {
    const rashifals = await DailyRashifal.find().sort({ createdAt: -1 });
    res.json({
      status: true,
      data: rashifals
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching rashifal data: ' + error.message
    });
  }
});

module.exports = router; 