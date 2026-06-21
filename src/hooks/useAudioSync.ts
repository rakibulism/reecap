import { useEffect, useRef } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { slideDuration } from '../lib/utils';

export function useAudioSync() {
  const { isPlaying, audio, activeIndex, settings, photos, playbackSpeed, playbackProgress, setPlaying } = useReecapStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tear down the audio element when the hook unmounts (e.g. navigating away
  // from /app), so playback doesn't leak onto other routes and remounting
  // doesn't spawn a second element. Also stop playback to keep store state honest.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setPlaying(false);
    };
  }, [setPlaying]);

  // Audio offset = elapsed timeline time up to the playhead, using cumulative
  // per-slide durations (slides can have custom durations), scaled by speed.
  const audioTargetTime = () => {
    let elapsed = 0;
    for (let i = 0; i < activeIndex && i < photos.length; i++) {
      elapsed += slideDuration(photos[i], settings);
    }
    elapsed += playbackProgress * slideDuration(photos[activeIndex], settings);
    return elapsed / playbackSpeed;
  };

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
      // Calculate current time from cumulative per-slide durations
      const currentTime = audioTargetTime();

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
      const targetTime = audioTargetTime();

      // Gentle sync
      if (Math.abs(audioRef.current!.currentTime - targetTime) > 0.3) {
        audioRef.current!.currentTime = targetTime;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, audio, activeIndex, playbackProgress, settings.duration, playbackSpeed]);

  return null;
}
