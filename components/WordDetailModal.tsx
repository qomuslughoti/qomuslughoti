'use client';

import { Word } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface WordDetailModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WordDetailModal({ word, isOpen, onClose }: WordDetailModalProps) {
  if (!word) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 sm:p-10 overflow-y-auto">
              {word.category && (
                <div className="flex justify-center mb-6">
                  <span className="px-4 py-1.5 bg-primary-light text-primary-dark text-sm font-bold rounded-full">
                    {word.category}
                  </span>
                </div>
              )}

              {/* Image, Arabic Text & Audio */}
              <div className="flex flex-col items-center justify-center mb-10 gap-6">
                {word.image_url && (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-2">
                    <img src={word.image_url} alt={word.meaning_id} className="w-full h-full object-cover" />
                  </div>
                )}
                <h2 className="text-6xl sm:text-7xl font-arabic text-primary text-center leading-tight" dir="rtl">
                  {word.arabic_text}
                </h2>
                
                {word.audio_url && (
                  <AudioPlayer url={word.audio_url} />
                )}
              </div>

              {/* Details */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <div className="mb-6 text-center">
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Arti</h3>
                  <p className="text-2xl font-bold text-text">{word.meaning_id}</p>
                </div>

                {word.example_sentence && (
                  <div className="text-center pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Contoh Kalimat</h3>
                    <p className="text-2xl font-arabic text-text mb-3" dir="rtl">
                      {word.example_sentence}
                    </p>
                    {word.example_translation && (
                      <p className="text-base text-text-muted italic">
                        "{word.example_translation}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
