const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const KoshDhatu = require('../models/KoshDhatu');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload KoshDhatu data
router.post('/upload-koshdhatu', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'No file uploaded' });
    }

    // Clear all existing entries before uploading new data
    await KoshDhatu.deleteMany({});
    console.log('Cleared all existing KoshDhatu entries');

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let savedCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        // Ensure all fields are strings, even if empty
        const koshDhatuData = {
          id: String(row.id || ''),
          title_hn: String(row.title_hn || ''),
          title_en: String(row.title_en || ''),
          title_sn: String(row.title_sn || ''),
          meaning: String(row.meaning || ''),
          structure: String(row.structure || ''),
          search: String(row.search || ''),
          image: String(row.image || ''),
          vishesh: String(row.vishesh || ''),
          date_rashifal: row.date_rashifal ? new Date(row.date_rashifal) : new Date()
        };

        await KoshDhatu.create(koshDhatuData);
        savedCount++;
      } catch (error) {
        console.error('Error saving row:', error);
        errorCount++;
      }
    }

    res.json({
      status: true,
      message: `Successfully saved ${savedCount} entries. ${errorCount} errors occurred.`,
      data: {
        saved: savedCount,
        errors: errorCount
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({
      status: false,
      message: 'Error processing file',
      error: error.message
    });
  }
});

// Get current KoshDhatu data
router.get('/koshdhatu/current', async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // 10 entries per page
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalEntries = await KoshDhatu.countDocuments();
    const totalPages = Math.ceil(totalEntries / limit);
    
    console.log('Pagination data:', { page, limit, skip, totalEntries, totalPages });
    
    // Fetch paginated entries
    const entries = await KoshDhatu.find()
      .sort({ date_rashifal: -1 })
      .skip(skip)
      .limit(limit);

    const responseData = {
      status: true,
      message: 'KoshDhatu entries retrieved successfully',
      data: entries.map(entry => ({
        id: entry.id || '',
        title_hn: entry.title_hn || '',
        title_en: entry.title_en || '',
        title_sn: entry.title_sn || '',
        meaning: entry.meaning || '',
        structure: entry.structure || '',
        search: entry.search || '',
        image: entry.image || '',
        vishesh: entry.vishesh || '',
        date_rashifal: entry.date_rashifal,
        _id: entry._id,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEntries: totalEntries,
        entriesPerPage: limit
      }
    };
    
    console.log('API Response structure:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching KoshDhatu data:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching KoshDhatu data',
      error: error.message
    });
  }
});

// Get a single KoshDhatu entry by ID
router.get('/koshdhatu/:id', async (req, res) => {
  try {
    const entry = await KoshDhatu.findById(req.params.id);
    if (!entry) return res.json({ status: false, message: 'Not found' });
    res.json({ status: true, entry });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

// Update a KoshDhatu entry by ID
router.put('/koshdhatu/:id', async (req, res) => {
  try {
    const updated = await KoshDhatu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.json({ status: false, message: 'Not found' });
    res.json({ status: true, entry: updated });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router; 