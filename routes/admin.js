const express = require('express');
const fs = require('fs');
const XLSX = require('xlsx');
const upload = require('../middleware/upload');
const KoshEntry = require('../models/KoshEntry');

const router = express.Router();

// — Single Excel upload for one monthCat
// POST /admin/upload?month=2
router.post('/upload', upload.single('file'), async (req, res) => {
  const monthCat = req.query.month;
  if (!monthCat) return res.status(400).send('Missing month');    // validate

  // parse Excel → JSON array of rows
  const wb = XLSX.readFile(req.file.path);                        // :contentReference[oaicite:7]{index=7}
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

  // clear old entries & bulk insert new
  await KoshEntry.deleteMany({ monthCat });                       // :contentReference[oaicite:8]{index=8}
  const toInsert = data.map(r => ({ ...r, monthCat }));
  await KoshEntry.insertMany(toInsert);                           // :contentReference[oaicite:9]{index=9}

  fs.unlinkSync(req.file.path);
  res.json({ status: true, message: `Uploaded month ${monthCat} ${toInsert.length} entries`, count: toInsert.length, data: toInsert });
});

// — Bulk upload all 12 months at once
const fields = Array.from({length:12}, (_,i)=>({ name: 'm'+(i+2), maxCount:1 }));
router.post('/bulk-upload', upload.fields(fields), async (req, res) => {
  let total = 0;
  for (let [field, arr] of Object.entries(req.files)) {
    const monthCat = field.slice(1);
    const wb = XLSX.readFile(arr[0].path);
    const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    await KoshEntry.deleteMany({ monthCat });
    const toInsert = data.map(r=>({ ...r, monthCat }));
    await KoshEntry.insertMany(toInsert);
    fs.unlinkSync(arr[0].path);
    total += toInsert.length;
  }
  res.json({ status: true, message: 'Bulk upload complete', totalInserted: total });
});

// — Delete entries by monthCat & id
// DELETE /admin/koshCat/2/5
router.delete('/koshCat/:monthCat/:id', async (req, res) => {
  const { monthCat, id } = req.params;
  const result = await KoshEntry.deleteMany({ monthCat, id });
  res.json({ status: true, message: 'Deleted', deletedCount: result.deletedCount });
});

module.exports = router;
