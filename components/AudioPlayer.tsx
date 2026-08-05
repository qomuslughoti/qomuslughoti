'use client';

import { Volume2, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(url);
    
    const handleEnded = () => setIsPlaying(false);
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={togglePlay}
      className={`p-4 rounded-full flex items-center justify-center transition-colors shadow-md ${
        isPlaying 
          ? 'bg-accent-2 text-white shadow-accent-2/30' 
          : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30'
      }`}
      aria-label="Play pronunciation"
    >
      {isPlaying ? (
        <Square className="w-8 h-8 fill-current" />
      ) : (
        <Volume2 className="w-8 h-8" />
      )}
    </motion.button>
  );
}
