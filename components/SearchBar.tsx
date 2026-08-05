'use client';

import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Cari kata bahasa Arab...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        scale: isFocused ? 1.02 : 1,
        boxShadow: isFocused ? '0 10px 25px -5px rgba(37, 99, 235, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
      }}
      className="relative w-full h-14 bg-white rounded-full flex items-center px-6 border-2 transition-colors duration-200"
      style={{
        borderColor: isFocused ? 'var(--color-primary)' : 'var(--color-primary-light)',
      }}
    >
      <Search 
        className={`w-6 h-6 transition-colors ${isFocused ? 'text-primary' : 'text-text-muted'}`} 
      />
      
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 h-full bg-transparent border-none outline-none px-4 text-lg text-text placeholder:text-text-muted font-sans"
        dir="auto" // Supports both LTR and RTL typing gracefully
      />

      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearSearch}
            className="p-1 rounded-full bg-gray-100 text-text-muted hover:bg-gray-200 hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
