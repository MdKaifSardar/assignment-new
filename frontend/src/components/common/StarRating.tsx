import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  interactive?: boolean;
  onRate?: (value: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onRate,
  size = 18,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= Math.round(displayRating);
        return (
          <Star
            key={starIndex}
            size={size}
            className={`star-icon ${isFilled ? 'filled' : ''} ${
              interactive ? 'interactive' : ''
            }`}
            fill={isFilled ? '#f59e0b' : 'transparent'}
            onClick={() => interactive && onRate && onRate(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(null)}
          />
        );
      })}
    </div>
  );
};
