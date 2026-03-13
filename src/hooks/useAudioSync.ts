import { useEffect, useRef } from 'react';
import { useReecapStore } from '../store/reecapStore';

export function useAudioSync() {
  const { isPlaying, audio, activeIndex, settings, photos, playbackSpeed, playbackProgress } = useReecapStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    if (audio) {
      audioRef.current.src = audio.url;
    } else {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [audio?.url]);

  // Sync Play/Pause
  useEffect(() => {
    if (!audioRef.current || !audio) return;

    if (isPlaying && photos.length > 0) {
      // Calculate current time based on timeline position
      // Slide duration is settings.duration / playbackSpeed
      const slideDuration = settings.duration / playbackSpeed;
      const currentTime = (activeIndex * slideDuration) + (playbackProgress * slideDuration);
      
      // Only set time if diff is significant (> 0.2s) to avoid stuttering
      if (Math.abs(audioRef.current.currentTime - currentTime) > 0.2) {
        audioRef.current.currentTime = currentTime;
      }
      
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audio, photos.length]);

  // Periodic sync while playing
  useEffect(() => {
    if (!isPlaying || !audioRef.current || !audio) return;

    const interval = setInterval(() => {
      const slideDuration = settings.duration / playbackSpeed;
      const targetTime = (activeIndex * slideDuration) + (playbackProgress * slideDuration);
      
      // Gentle sync
      if (Math.abs(audioRef.current!.currentTime - targetTime) > 0.3) {
        audioRef.current!.currentTime = targetTime;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, audio, activeIndex, playbackProgress, settings.duration, playbackSpeed]);

  return null;
}
