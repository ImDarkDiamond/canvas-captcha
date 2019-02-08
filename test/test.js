// Require Packages
const Captcha = new (require('../index.js'))(150, 50, 5, { fontSize: 55 }); // Define Captcha Template
const fs = require('fs');

// Generate Captcha
const { buffer, text } = Captcha.createCaptcha();

// Write Captcha
fs.writeFile('image.png', buffer, (err) => {
  if (err) throw err;
  console.log('[Generated] Text:', text);
});