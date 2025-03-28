const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail_path: {
    type: DataTypes.STRING
  },
  duration: {
    type: DataTypes.INTEGER
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'Videos'
});

const VideoProgress = sequelize.define('VideoProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  videoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastWatched: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'VideoProgresses'
});

Video.hasMany(VideoProgress, { foreignKey: 'videoId' });
VideoProgress.belongsTo(Video, { foreignKey: 'videoId' });

module.exports = { Video, VideoProgress };