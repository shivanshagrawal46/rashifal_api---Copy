const express = require('express');
const router = express.Router();
const KoshEntry = require('../models/KoshEntry');
const DailyRashifal = require('../models/DailyRashifal');
const KoshDhatu = require('../models/KoshDhatu');

/** Static metadata for all 12 months of 2025 **/
const MONTHS_2025 = [
  { id: "2",  name: "jan 2025",    cover_image: "", position: "1" },
  { id: "3",  name: "Feb 2025",    cover_image: "", position: "2" },
  { id: "4",  name: "march 2025",  cover_image: "", position: "3" },
  { id: "5",  name: "april 2025",  cover_image: "", position: "4" },
  { id: "6",  name: "may 2025",    cover_image: "", position: "5" },
  { id: "7",  name: "jun 2025",    cover_image: "", position: "6" },
  { id: "8",  name: "july 2025",   cover_image: "", position: "7" },
  { id: "9",  name: "August 2025", cover_image: "", position: "8" },
  { id: "10", name: "sept 2025",   cover_image: "", position: "9" },
  { id: "11", name: "Oct 2025",    cover_image: "", position: "10" },
  { id: "12", name: "nov 2025",    cover_image: "", position: "11" },
  { id: "13", name: "dec 2025",    cover_image: "", position: "12" },
];

// — Return full list of months
router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'Months found',
    data: {
      kosh: MONTHS_2025,
      vishesh_suchi: [],
      screenCoverImage: "",
      catTitle: ""
    }
  });
});

// Get KoshDhatu data API endpoint - MUST BE BEFORE THE /:catId ROUTE
router.get('/30', async (req, res) => {
  try {
    console.log('KoshDhatu API endpoint called');
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 30 entries per page
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

    console.log(`Found ${entries.length} KoshDhatu entries`);

    // Return the complete document with pagination
    res.json({
      status: true,
      message: "KoshDhatu data retrieved successfully",
      data: entries.map(entry => ({
        id: entry.id,
        title_hn: entry.title_hn,
        title_en: entry.title_en,
        title_sn: entry.title_sn,
        meaning: entry.meaning,
        structure: entry.structure,
        search: entry.search,
        image: entry.image,
        vishesh: entry.vishesh,
        date_rashifal: entry.date_rashifal
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEntries: totalEntries,
        entriesPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching KoshDhatu data:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching KoshDhatu data',
      error: error.message
    });
  }
});

// — Return all entries for a particular month (catId)
router.get('/:catId', async (req, res) => {
  const { catId } = req.params;
  console.log('API called with catId:', catId);
  
  // Special handling for daily rashifal (catId = 20)
  if (catId == "20") {
    try {
      const dailyRashifals = await DailyRashifal.find().sort({ createdAt: -1 });
      console.log(`Found ${dailyRashifals.length} daily rashifals`);
      
      return res.json({
        status: true,
        message: 'Daily rashifal entries found',
        data: {
          kosh: dailyRashifals,
          vishesh_suchi: [],
          intro: "Daily Rashifal",
          filters: { sort_by: ["newest", "oldest"] },
          pagination_settings: {
            total_pages: 1,
            current_page_no: 1,
            total_records: dailyRashifals.length,
            records_per_page: dailyRashifals.length
          },
          category_title: "Daily Rashifal"
        }
      });
    } catch (err) {
      console.error('Daily rashifal error:', err);
      return res.status(500).json({ status: false, message: 'Server Error' });
    }
  }
  
  // Original code for monthly rashifals
  try {
    const entries = await KoshEntry.find({ monthCat: catId });

    res.json({
      status: true,
      message: 'Kosh entries found',
      data: {
        kosh: entries,
        vishesh_suchi: [],
        intro: "",
        filters: { sort_by: ["new_title", "most_viewed"] },
        pagination_settings: {
          total_pages: 1,
          current_page_no: 1,
          total_records: entries.length,
          records_per_page: entries.length
        },
        category_title: ""
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server Error' });
  }
});

// — Return single entry by month and id
router.get('/:catId/:id', async (req, res) => {
  const { catId, id } = req.params;
  
  // Special handling for daily rashifal (catId = 20)
  if (catId === "20") {
    try {
      const dailyRashifal = await DailyRashifal.findById(id);
      
      if (!dailyRashifal) {
        return res.status(404).json({ status: false, message: 'Daily rashifal entry not found' });
      }
      
      return res.json({
        status: true,
        message: 'Daily rashifal entry found',
        data: dailyRashifal
      });
    } catch (err) {
      console.error('Daily rashifal error:', err);
      return res.status(500).json({ status: false, message: 'Server Error' });
    }
  }
  
  // Original code for monthly rashifals
  try {
    const entry = await KoshEntry.findOne({ monthCat: catId, id });

    if (!entry) {
      return res.status(404).json({ status: false, message: 'Entry not found' });
    }

    res.json({
      status: true,
      message: 'Kosh entry found',
      data: entry
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server Error' });
  }
});

module.exports = router;





























// const express = require('express');
// const router  = express.Router();
// const KoshEntry = require('../models/KoshEntry');

// /** Static metadata for all 12 months of 2025 **/
// const MONTHS_2025 = [
//   { id: "2",  name: "jan 2025",    cover_image: "", position: "1" },
//   { id: "3",  name: "Feb 2025",    cover_image: "", position: "2" },
//   { id: "4",  name: "march 2025",  cover_image: "", position: "3" },
//   { id: "5",  name: "april 2025",  cover_image: "", position: "4" },
//   { id: "6",  name: "may 2025",    cover_image: "", position: "5" },
//   { id: "7",  name: "jun 2025",    cover_image: "", position: "6" },
//   { id: "8",  name: "july 2025",   cover_image: "", position: "7" },
//   { id: "9",  name: "August 2025", cover_image: "", position: "8" },
//   { id: "10", name: "sept 2025",   cover_image: "", position: "9" },
//   { id: "11", name: "Oct 2025",    cover_image: "", position: "10" },
//   { id: "12", name: "nov 2025",    cover_image: "", position: "11" },
//   { id: "13", name: "dec 2025",    cover_image: "", position: "12" },
// ];

// // — Return full list of months
// router.get('/:catId', async (req, res) => {
//   res.json({
//     status: true,
//     message: 'Kosh found',
//     data: {
//       kosh: MONTHS_2025,
//       vishesh_suchi: [],
//       screenCoverImage: "",
//       catTitle: ""
//     }
//   });
// });

// // — Return horoscope entries for one month & zodiac id
// router.get('/:catId/:id', async (req, res) => {
//   const { catId, id } = req.params;
//   const entries = await KoshEntry.find({ monthCat: catId, id });    // :contentReference[oaicite:1]{index=1}

//   res.json({
//     status: true,
//     message: 'Kosh found',
//     data: {
//       kosh: entries,
//       vishesh_suchi: [],
//       intro: "",
//       filters: { sort_by: ["new_title", "most_viewed"] },
//       pagination_settings: {
//         total_pages: 1,
//         current_page_no: 1,
//         total_records: entries.length,
//         records_per_page: entries.length
//       },
//       category_title: ""
//     }
//   });
// });

// module.exports = router;
