'use client';

import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Input } from '@/components/atoms';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  className?: string;
  accent?: 'indigo' | 'yellow';
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}

export const SearchBar = ({
  placeholder = 'Search...',
  value = '',
  className,
  accent = 'indigo',
  onChange,
  onSearch,
}: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState(value);

  const accentConfig = {
    indigo: {
      glow: 'from-indigo-500 to-purple-500',
      iconFocus: 'group-focus-within:text-indigo-500',
      inputFocus: 'focus:border-indigo-300 focus:ring-indigo-200',
    },
    yellow: {
      glow: 'from-yellow-400 to-amber-500',
      iconFocus: 'group-focus-within:text-yellow-600',
      inputFocus: 'focus:border-yellow-400 focus:ring-yellow-200',
    },
  } as const;

  const accents = accentConfig[accent];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleSearch = () => {
    onSearch?.(searchValue);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`group relative flex w-full max-w-md items-center ${className ?? ''}`}>
      {/* Decorative gradient border */}
      <div
        className={`absolute -inset-0.5 rounded-lg bg-gradient-to-r ${accents.glow} opacity-0 blur transition duration-300 group-focus-within:opacity-100`}
      />

      <div className="relative flex w-full items-center">
        {/* Search icon */}
        <div
          className={`absolute left-3 text-gray-400 transition-colors duration-300 ${accents.iconFocus}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transition-transform duration-300 group-focus-within:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className={`flex-1 border-gray-200 bg-white/80 pr-4 pl-10 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md focus:ring-2 ${accents.inputFocus}`}
        />

        {searchValue && (
          <button
            onClick={() => {
              setSearchValue('');
              onChange?.('');
            }}
            className="absolute right-3 text-gray-400 transition-colors duration-300 hover:text-gray-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
