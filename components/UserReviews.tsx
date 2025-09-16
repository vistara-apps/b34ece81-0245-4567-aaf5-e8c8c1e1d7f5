'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { User } from '../lib/types';

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  itemTitle: string;
  createdAt: string;
}

interface UserReviewsProps {
  user: User;
  reviews?: Review[];
  showTitle?: boolean;
  maxReviews?: number;
}

export function UserReviews({
  user,
  reviews: providedReviews,
  showTitle = true,
  maxReviews = 5
}: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!providedReviews);

  // Mock reviews for demonstration
  useEffect(() => {
    if (providedReviews) {
      setReviews(providedReviews);
      return;
    }

    // Generate mock reviews
    const mockReviews: Review[] = [
      {
        id: '1',
        reviewerId: 'user_2',
        reviewerName: 'Alice Johnson',
        reviewerAvatar: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=AJ',
        rating: 5,
        comment: 'Great experience! Very reliable and the item was exactly as described.',
        itemTitle: 'Power Drill',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        reviewerId: 'user_3',
        reviewerName: 'Bob Smith',
        reviewerAvatar: 'https://via.placeholder.com/40x40/059669/FFFFFF?text=BS',
        rating: 4,
        comment: 'Good communication and fair pricing. Would borrow again.',
        itemTitle: 'Bluetooth Speaker',
        createdAt: '2024-01-10T14:30:00Z'
      },
      {
        id: '3',
        reviewerId: 'user_4',
        reviewerName: 'Carol Davis',
        reviewerAvatar: 'https://via.placeholder.com/40x40/DC2626/FFFFFF?text=CD',
        rating: 5,
        comment: 'Excellent lender! Took great care of the item and returned it on time.',
        itemTitle: 'Tennis Racket',
        createdAt: '2024-01-08T09:15:00Z'
      }
    ];

    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 500);
  }, [providedReviews]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <h3 className="text-lg font-semibold text-text-primary">Reviews</h3>}
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Reviews</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-text-secondary">
              {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-secondary">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, maxReviews).map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <UserAvatar
                  src={review.reviewerAvatar}
                  alt={review.reviewerName}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-text-primary">{review.reviewerName}</p>
                    <span className="text-sm text-text-secondary">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="text-sm text-text-secondary">
                      for "{review.itemTitle}"
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-text-primary">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {reviews.length > maxReviews && (
            <div className="text-center">
              <button className="text-sm text-primary hover:underline">
                View all {reviews.length} reviews
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

