const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { Video, VideoProgress } = require('../models/Video');

// Configurar FFmpeg con rutas absolutas (ajusta según tu instalación)
ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const videoPath = req.file.path;
    const thumbnailName = `${req.file.filename}.jpg`;
    const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', thumbnailName);
    
    // Crear directorio de thumbnails si no existe
    if (!fs.existsSync(path.dirname(thumbnailPath))) {
      fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
    }

    // Crear thumbnail
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => {
          if (!fs.existsSync(thumbnailPath)) {
            return reject(new Error('Thumbnail file was not created'));
          }
          resolve();
        })
        .on('error', reject)
        .screenshots({
          count: 1,
          timestamps: ['00:00:01'],
          filename: thumbnailName,
          folder: path.dirname(thumbnailPath),
          size: '320x240'
        });
    });

    // Obtener duración
    const duration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);
        if (!metadata?.format?.duration) {
          return reject(new Error('Could not get video duration'));
        }
        resolve(Math.floor(metadata.format.duration));
      });
    });

    const video = await Video.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      file_path: videoPath,
      thumbnail_path: thumbnailPath,
      duration,
      created_at: new Date()
    });

    res.status(201).json({
      id: video.id,
      title: video.title,
      thumbnail_url: `/uploads/thumbnails/${thumbnailName}`
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Error uploading video' });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
      attributes: ['id', 'title', 'description', 'duration', 'views', 'thumbnail_path', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    
    const videosWithUrls = videos.map(video => ({
      ...video.get({ plain: true }),
      thumbnail_url: video.thumbnail_path ? 
        video.thumbnail_path.replace(/^.*[\\\/]uploads[\\\/]/, '/uploads/') : 
        null
    }));
    
    res.json(videosWithUrls);
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ error: 'Error getting videos' });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    video.views += 1;
    await video.save();
    
    res.json({
      ...video.get({ plain: true }),
      thumbnail_url: video.thumbnail_path.replace(/^.*[\\\/]uploads[\\\/]/, '/uploads/')
    });
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ error: 'Error getting video' });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const videoPath = video.file_path;
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
      
      if (start >= fileSize || end >= fileSize) {
        return res.status(416).json({ error: 'Requested range not satisfiable' });
      }

      const chunksize = (end-start)+1;
      const file = fs.createReadStream(videoPath, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ error: 'Error streaming video' });
  }
};
// Cache simple para progresos
const progressCache = new Map();

// Guardar progreso con validación mejorada
exports.saveProgress = async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const progress = parseInt(req.body.progress);
    const userId = 1; // En producción usarías el ID de usuario real

    if (isNaN(videoId)) return res.status(400).json({ error: 'ID de video inválido' });
    if (isNaN(progress)) return res.status(400).json({ error: 'Progreso inválido' });

    // Actualizar caché
    progressCache.set(`${userId}_${videoId}`, progress);

    const [progressRecord] = await VideoProgress.upsert({
      userId,
      videoId,
      progress,
      lastWatched: new Date()
    }, {
      returning: true
    });

    res.json({
      success: true,
      progress: progressRecord.progress
    });
  } catch (error) {
    console.error('Error al guardar progreso:', error);
    res.status(500).json({ 
      error: 'Error al guardar progreso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener progreso con caché
exports.getProgress = async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const userId = 1;

    if (isNaN(videoId)) {
      return res.status(400).json({ error: 'ID de video inválido' });
    }

    // Verificar caché primero
    const cacheKey = `${userId}_${videoId}`;
    if (progressCache.has(cacheKey)) {
      return res.json({
        success: true,
        progress: progressCache.get(cacheKey),
        cached: true
      });
    }

    const progressRecord = await VideoProgress.findOne({
      where: { userId, videoId },
      attributes: ['progress'],
      raw: true
    });

    const progress = progressRecord ? progressRecord.progress : 0;
    
    // Almacenar en caché
    progressCache.set(cacheKey, progress);
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ 
      error: 'Error al obtener progreso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};