const xlsx = require('xlsx');
const path = require('path');

// Create test data with all required fields
const testData = [
  {
    title_hn: "आज का राशिफल",
    title_en: "Today's Horoscope",
    details_hn: "आज का विवरण - मेष राशि के लिए शुभ समाचार है। आपका दिन बहुत अच्छा रहेगा।",
    details_en: "Today's details - Good news for Aries. Your day will be very good."
  },
  {
    title_hn: "कल का राशिफल",
    title_en: "Tomorrow's Horoscope",
    details_hn: "कल का विवरण - वृषभ राशि के लिए धन लाभ की संभावना है।",
    details_en: "Tomorrow's details - Possibility of financial gain for Taurus."
  }
];

// Create a new workbook
const workbook = xlsx.utils.book_new();

// Convert data to worksheet
const worksheet = xlsx.utils.json_to_sheet(testData);

// Add worksheet to workbook
xlsx.utils.book_append_sheet(workbook, worksheet, "Daily Rashifal");

// Write file
const filePath = path.join(__dirname, 'test_daily_rashifal.xlsx');
xlsx.writeFile(workbook, filePath);

console.log('Test file created at:', filePath); 