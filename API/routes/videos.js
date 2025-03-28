const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videos');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Only MP4 videos are allowed'), false);
    }
  }
});

router.post('/', upload.single('video'), videoController.uploadVideo);
router.get('/', videoController.getVideos);
router.get('/:id', videoController.getVideo);
router.get('/:id/stream', videoController.streamVideo);
router.post('/:id/progress', express.json(), videoController.saveProgress);
router.get('/:id/progress', videoController.getProgress);
module.exports = router;