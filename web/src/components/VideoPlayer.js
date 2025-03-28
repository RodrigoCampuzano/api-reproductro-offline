import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VideoPlayer = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [hasSetInitialTime, setHasSetInitialTime] = useState(false);

  // Manejar interacción del usuario
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(e => {
          console.log('Error al reproducir:', e);
          videoRef.current.muted = true;
          videoRef.current.play();
        });
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleUserInteraction);
    return () => document.removeEventListener('click', handleUserInteraction);
  }, []);

  // Obtener progreso guardado
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProgress = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/videos/${id}/progress`,
          { signal: controller.signal }
        );
        
        if (isMounted && response.data.success) {
          setProgress(response.data.progress);
          console.log('Progreso cargado:', response.data.progress);
        }
      } catch (err) {
        if (isMounted && err.name !== 'CanceledError') {
          console.error('Error al obtener progreso:', err);
        }
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  // Configurar el video cuando esté listo
  useEffect(() => {
    const video = videoRef.current;
    if (!isReady || !video || hasSetInitialTime) return;

    const handleLoadedMetadata = () => {
      if (progress > 1 && !hasSetInitialTime) {
        video.currentTime = progress;
        setHasSetInitialTime(true);
        console.log(`Tiempo establecido a: ${progress} segundos`);
      }

      const tryPlay = () => {
        if (userInteracted) {
          video.muted = false;
          video.play()
            .then(() => console.log('Reproducción con sonido exitosa'))
            .catch(err => {
              console.log('Intentando reproducir sin sonido:', err);
              video.muted = true;
              video.play();
            });
        } else {
          video.muted = true;
          video.play()
            .then(() => console.log('Autoplay con mute exitoso'))
            .catch(e => console.log('Autoplay bloqueado:', e));
        }
      };

      // Pequeño retraso para mayor confiabilidad
      setTimeout(tryPlay, 500);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isReady, progress, userInteracted, hasSetInitialTime]);

  // Guardar progreso periódicamente
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let saveTimeout;
    let lastSavedProgress = -1;

    const handleTimeUpdate = () => {
      const currentProgress = Math.floor(video.currentTime);
      
      // Guardar solo si ha cambiado significativamente
      if (Math.abs(currentProgress - lastSavedProgress) >= 5) {
        clearTimeout(saveTimeout);
        
        saveTimeout = setTimeout(() => {
          axios.post(
            `http://localhost:5000/api/videos/${id}/progress`,
            { progress: currentProgress },
            { headers: { 'Content-Type': 'application/json' } }
          ).then(() => {
            console.log('Progreso guardado:', currentProgress);
            lastSavedProgress = currentProgress;
          }).catch(err => {
            console.error('Error al guardar progreso:', err);
          });
        }, 1000); // Debounce de 1 segundo
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      clearTimeout(saveTimeout);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      
      // Guardar al desmontar
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        const currentProgress = Math.floor(video.currentTime);
        axios.post(
          `http://localhost:5000/api/videos/${id}/progress`,
          { progress: currentProgress }
        );
      }
    };
  }, [id]);

  if (!isReady) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tu progreso...</p>
      </div>
    );
  }

  return (
    <div className="video-container" onClick={handleUserInteraction}>
      <video
        ref={videoRef}
        controls
        muted={!userInteracted}
        preload="auto"
        playsInline
      >
        <source src={`http://localhost:5000/api/videos/${id}/stream`} type="video/mp4" />
        Tu navegador no soporta videos HTML5
      </video>
      {!userInteracted && (
        <div className="play-message">
          Haz clic en el video para habilitar el sonido
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;