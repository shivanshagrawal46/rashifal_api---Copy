const express = require('express');
const router = express.Router();
const MCQCategory = require('../models/mcqCategory');
const MCQSubcategory = require('../models/mcqSubcategory');
const MCQQuestion = require('../models/mcqQuestion');

// Test route - should be first
router.get('/test', (req, res) => {
  res.json({ message: 'MCQ API router is working' });
});

// API Routes for MCQ data
// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await MCQCategory.find().sort({ id: 1 });
    
    res.json({
      status: true,
      data: categories.map(category => ({
        id: category.id,
        category_name: category.category_name
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Add new MCQ category
router.post('/add', async (req, res) => {
  try {
    const { category_name } = req.body;
    
    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Category name is required'
      });
    }

    // Get the last category to determine the next ID
    const lastCategory = await MCQCategory.findOne().sort({ id: -1 });
    const nextId = lastCategory ? lastCategory.id + 1 : 1;

    const newCategory = new MCQCategory({
      id: nextId,
      category_name: category_name.trim()
    });

    await newCategory.save();

    res.status(201).json({
      status: true,
      message: 'Category added successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({
      status: false,
      message: 'Error adding category',
      error: error.message
    });
  }
});

// Get all categories (admin route)
router.get('/all', async (req, res) => {
  try {
    const categories = await MCQCategory.find().sort({ id: 1 });
    
    res.json({
      status: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Get individual MCQ category (admin route)
router.get('/mcq-category/:id', async (req, res) => {
  try {
    const category = await MCQCategory.findOne({ id: parseInt(req.params.id) });
    
    if (!category) {
      return res.status(404).render('error', {
        message: 'Category not found'
      });
    }

    res.render('mcqCategory', {
      category: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).render('error', {
      message: 'Error loading category'
    });
  }
});

// Delete MCQ category
router.delete('/:id', async (req, res) => {
  try {
    const category = await MCQCategory.findOneAndDelete({ id: parseInt(req.params.id) });
    
    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found'
      });
    }

    res.json({
      status: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      status: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

// Get subcategories for a specific category
router.get('/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    
    // First verify if category exists
    const category = await MCQCategory.findOne({ id: categoryId });
    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found'
      });
    }

    const subcategories = await MCQSubcategory.find({ category_id: categoryId }).sort({ id: 1 });
    
    res.json({
      status: true,
      data: {
        category: {
          id: category.id,
          category_name: category.category_name
        },
        subcategories: subcategories.map(subcategory => ({
          id: subcategory.id,
          subcategory_name: subcategory.subcategory_name
        }))
      }
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

// Get questions for a specific subcategory
router.get('/:categoryId/:subcategoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const subcategoryId = parseInt(req.params.subcategoryId);
    
    // Verify if category exists
    const category = await MCQCategory.findOne({ id: categoryId });
    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found'
      });
    }

    // Verify if subcategory exists
    const subcategory = await MCQSubcategory.findOne({ 
      id: subcategoryId,
      category_id: categoryId
    });
    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found'
      });
    }

    const questions = await MCQQuestion.find({ subcategory_id: subcategoryId }).sort({ id: 1 });
    
    res.json({
      status: true,
      data: {
        category: {
          id: category.id,
          category_name: category.category_name
        },
        subcategory: {
          id: subcategory.id,
          subcategory_name: subcategory.subcategory_name
        },
        questions: questions.map(question => ({
          id: question.id,
          question: question.question,
          options: {
            option1: question.option1,
            option2: question.option2,
            option3: question.option3,
            option4: question.option4
          },
          correct_option: question.correct_option
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

module.exports = router; 