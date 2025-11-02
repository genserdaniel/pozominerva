import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import './PodcastPlayer.css';

const PodcastPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Actualizar tiempo actual
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  // Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Mute/Unmute
  const toggleMute = () => {
    const audio = audioRef.current;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Cambiar volumen
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Cambiar posición de reproducción
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Formatear tiempo (MM:SS)
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`podcast-player ${isMinimized ? 'minimized' : ''}`}>
      <audio ref={audioRef} src="/audio/podcast.mp3" preload="metadata" />

      <div className="podcast-player-container">
        {/* Información del podcast */}
        <div className="podcast-info">
          <div className="podcast-icon">🎙️</div>
          <div className="podcast-details">
            <div className="podcast-title">Podcast Informativo</div>
            <div className="podcast-subtitle">Proyecto Pozo de Minerva</div>
          </div>
        </div>

        {/* Controles de reproducción */}
        <div className="podcast-controls">
          {/* Botón Play/Pause */}
          <button
            className="control-btn play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          {/* Barra de progreso */}
          <div className="progress-container">
            <span className="time-current">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                  (currentTime / duration) * 100
                }%, #ddd ${(currentTime / duration) * 100}%, #ddd 100%)`
              }}
            />
            <span className="time-duration">{formatTime(duration)}</span>
          </div>

          {/* Controles de volumen */}
          <div className="volume-controls">
            <button
              className="control-btn volume-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              className="volume-bar"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Botón minimizar/maximizar */}
        <button
          className="minimize-btn"
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );
};

export default PodcastPlayer;
