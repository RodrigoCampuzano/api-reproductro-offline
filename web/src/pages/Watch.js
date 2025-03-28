import React from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer'; // Importación correcta

const Watch = () => {
  const { id } = useParams();

  return (
    <div className="watch-page">
      <VideoPlayer /> {/* Uso correcto del componente */}
    </div>
  );
};

export default Watch; // Exportación correcta