const app = require('./app');
const fs = require('fs');
const path = require('path');

// Crear directorios de upload si no existen
const uploadDirs = ['uploads/videos', 'uploads/thumbnails'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});