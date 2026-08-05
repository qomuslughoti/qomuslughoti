'use client';

import { Word } from '@/lib/types';
import { motion } from 'framer-motion';

interface WordCardProps {
  word: Word;
  onClick: (word: Word) => void;
}

export default function WordCard({ word, onClick }: WordCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(word)}
      className="bg-white p-6 rounded-3xl shadow-sm border-2 border-primary-light cursor-pointer transition-colors hover:border-primary/30 flex flex-col items-center sm:items-start text-center sm:text-left h-full"
    >
      <div className="w-full flex justify-between items-start mb-4">
        {word.category ? (
          <span className="inline-block px-3 py-1 bg-primary-light text-primary-dark text-xs font-bold rounded-full">
            {word.category}
          </span>
        ) : (
          <div></div> // Spacer if no category
        )}
      </div>

      <div 
        className="w-full text-4xl sm:text-5xl font-arabic text-primary mb-6 text-center sm:text-right"
        dir="rtl"
      >
        {word.arabic_text}
      </div>
      
      <div className="mt-auto w-full pt-4 border-t border-gray-100">
        <h3 className="text-xl font-bold text-text mb-1">{word.meaning_id}</h3>
        {word.example_sentence && (
          <p className="text-sm text-text-muted line-clamp-1 opacity-70">
            Klik untuk lihat contoh
          </p>
        )}
      </div>
    </motion.div>
  );
}
