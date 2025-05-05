const express = require('express');
const router = express.Router();
const MCQSubcategory = require('../models/mcqSubcategory');

// Get all subcategories for a category
router.get('/:categoryId', async (req, res) => {
  try {
    const subcategories = await MCQSubcategory.find({ category_id: parseInt(req.params.categoryId) })
      .sort({ id: 1 });
    
    res.json({
      status: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching subcategories',
      error: error.message
    });
  }
});

// Add new subcategory
router.post('/:categoryId', async (req, res) => {
  try {
    const { subcategory_name } = req.body;
    
    if (!subcategory_name || subcategory_name.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Subcategory name is required'
      });
    }

    // Get the last subcategory to determine the next ID
    const lastSubcategory = await MCQSubcategory.findOne().sort({ id: -1 });
    const nextId = lastSubcategory ? lastSubcategory.id + 1 : 1;

    const newSubcategory = new MCQSubcategory({
      id: nextId,
      category_id: parseInt(req.params.categoryId),
      subcategory_name: subcategory_name.trim()
    });

    await newSubcategory.save();

    res.status(201).json({
      status: true,
      message: 'Subcategory added successfully',
      data: newSubcategory
    });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({
      status: false,
      message: 'Error adding subcategory',
      error: error.message
    });
  }
});

// Delete subcategory
router.delete('/:id', async (req, res) => {
  try {
    const subcategory = await MCQSubcategory.findOneAndDelete({ id: parseInt(req.params.id) });
    
    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found'
      });
    }

    res.json({
      status: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({
      status: false,
      message: 'Error deleting subcategory',
      error: error.message
    });
  }
});

// Update subcategory
router.put('/:id', async (req, res) => {
  try {
    const { subcategory_name } = req.body;
    
    if (!subcategory_name || subcategory_name.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Subcategory name is required'
      });
    }

    const subcategory = await MCQSubcategory.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { subcategory_name: subcategory_name.trim() },
      { new: true }
    );
    
    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found'
      });
    }

    res.json({
      status: true,
      message: 'Subcategory updated successfully',
      data: subcategory
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({
      status: false,
      message: 'Error updating subcategory',
      error: error.message
    });
  }
});

module.exports = router; 