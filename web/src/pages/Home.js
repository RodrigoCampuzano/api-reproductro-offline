import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/videos');
        setVideos(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div>Loading videos...</div>;

  return (
    <div className="home">
      <h1>Video Player</h1>
      <Link to="/upload" className="upload-button">Upload Video</Link>
      
      <div className="video-list">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <Link to={`/watch/${video.id}`}>
              <div className="thumbnail-container">
                {video.thumbnail_path && (
                  <img 
                    src={`http://localhost:5000/${video.thumbnail_path.replace(/\\/g, '/')}`} 
                    alt={video.title}
                  />
                )}
                <span className="duration">{formatDuration(video.duration)}</span>
              </div>
              <h3>{video.title}</h3>
              <p>{video.views} views</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default Home;