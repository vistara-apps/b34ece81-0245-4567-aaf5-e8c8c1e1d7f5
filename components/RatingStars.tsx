'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= displayRating;
        const isPartial = starRating - 0.5 <= displayRating && displayRating < starRating;

        return (
          <button
            key={index}
            type="button"
            className={cn(
              'transition-colors duration-150',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              isFilled ? 'text-yellow-400' : 'text-gray-300'
            )}
            onClick={() => handleClick(starRating)}
            onMouseEnter={() => handleMouseEnter(starRating)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled && 'fill-current'
              )}
            />
          </button>
        );
      })}

      {interactive && (
        <span className="ml-2 text-sm text-text-secondary">
          {displayRating > 0 ? `${displayRating}/${maxRating}` : 'Rate this'}
        </span>
      )}
    </div>
  );
}

