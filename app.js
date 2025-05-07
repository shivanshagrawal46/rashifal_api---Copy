const mongoose = require('mongoose');
require('dotenv').config();
const db = require('./config/db');                  // connects to MongoDB Atlas
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const compression = require('compression');
const morgan = require('morgan');

const koshCatRouter = require('./routes/koshCat');
const adminRouter = require('./routes/admin');
const dailyRashifalRouter = require('./routes/dailyRashifal');
const koshDhatuRouter = require('./routes/koshDhatu');
const mcqCategoryRouter = require('./routes/mcqCategory');
const mcqSubcategoryRouter = require('./routes/mcqSubcategory');
const mcqQuestionRouter = require('./routes/mcqQuestion');

const app = express();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  next();
});

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root path redirect
app.get('/', (req, res) => {
  res.redirect('/login');
});

// credentials from .env
const USERNAME = process.env.ADMIN_USERNAME;
const HASHED_PASSWORD = process.env.ADMIN_HASH;

app.set('view engine', 'ejs');
app.set('views', './views');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('ERROR: MONGODB_URI is undefined');
  process.exit(1);
}

// Enable mongoose debug mode
mongoose.set('debug', true);

// Test the database connection and collections
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Session setup


app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(
  session({
    name: 'koshcat.sid',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Public API routes - Mount before other routes
app.use('/jyotish/api/v1/koshCat', koshCatRouter);
app.use('/jyotish/api/v1/m', mcqCategoryRouter);

// Add debug logging for MCQ routes
app.use((req, res, next) => {
  if (req.path.startsWith('/jyotish/api/v1/m')) {
    console.log('MCQ API Request:', req.method, req.path);
  }
  next();
});

//app.use('/jyotish/api/v1/koshCat/daily', koshCatRouter);

// Login routes
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Comparing', password, HASHED_PASSWORD);
  
  console.log(await bcrypt.compare(password, HASHED_PASSWORD))
  if (username === USERNAME && await bcrypt.compare(password, HASHED_PASSWORD)) {
    console.log(bcrypt.compare(password, HASHED_PASSWORD))
    req.session.user = USERNAME;
    return res.redirect('/admin');
  }
  res.render('login', { error: 'Invalid credentials' });
});
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('koshcat.sid');
    res.redirect('/login');
  });
});

// Auth guard
function checkAuth(req, res, next) {
  if (req.session.user === USERNAME) return next();
  res.redirect('/login');
}

// Protected admin routes
app.use('/admin', checkAuth);
app.get('/admin', (req, res) => res.render('dashboard'));
app.use('/admin', adminRouter);
app.use('/admin', dailyRashifalRouter);
app.use('/admin', koshDhatuRouter);
app.use('/admin', mcqCategoryRouter);
app.use('/admin/subcategories', mcqSubcategoryRouter);
app.use('/admin/mcq-questions', mcqQuestionRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: false,
    message: 'Internal server error',
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  console.log(`Admin username: ${process.env.ADMIN_USERNAME ? 'Set' : 'Not set'}`);
});


