'use client';

import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-3 justify-center mb-8 overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide w-full max-w-full">
      <FilterChip 
        label="Semua" 
        isActive={selectedCategory === null} 
        onClick={() => onSelect(null)} 
      />
      
      {categories.map((category) => (
        <FilterChip 
          key={category}
          label={category}
          isActive={selectedCategory === category}
          onClick={() => onSelect(category)}
        />
      ))}
    </div>
  );
}

function FilterChip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-200 border-2 ${
        isActive 
          ? 'bg-primary border-primary text-white shadow-md' 
          : 'bg-white border-primary-light text-primary hover:border-primary/50'
      }`}
    >
      {label}
    </motion.button>
  );
}
