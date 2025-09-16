'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
  );
}
