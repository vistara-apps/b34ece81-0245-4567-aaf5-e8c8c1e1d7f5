'use client';

import { useState } from 'react';
import { Button } from './Button';
import { TextArea } from './TextArea';
import { RatingStars } from './RatingStars';
import { UserAvatar } from './UserAvatar';
import type { User } from '../lib/types';

interface ReviewFormProps {
  reviewer: User;
  reviewee: User;
  itemTitle: string;
  transactionId: string;
  onSubmit: (review: {
    rating: number;
    comment: string;
    transactionId: string;
    reviewerId: string;
    revieweeId: string;
  }) => void;
  onCancel: () => void;
}

export function ReviewForm({
  reviewer,
  reviewee,
  itemTitle,
  transactionId,
  onSubmit,
  onCancel
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        transactionId,
        reviewerId: reviewer.userId,
        revieweeId: reviewee.userId
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Leave a Review</h2>

          {/* Reviewee Info */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <UserAvatar src={reviewee.profilePicUrl} alt={reviewee.displayName} size="md" />
            <div>
              <p className="font-medium text-text-primary">{reviewee.displayName}</p>
              <p className="text-sm text-text-secondary">For: {itemTitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Rating *
              </label>
              <RatingStars
                rating={rating}
                interactive={true}
                onRatingChange={setRating}
                size="lg"
              />
            </div>

            {/* Comment */}
            <TextArea
              label="Comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this transaction..."
              rows={4}
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Skip
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>

          <p className="text-xs text-text-secondary mt-4 text-center">
            Your review will be visible to other users and help build trust in the community.
          </p>
        </div>
      </div>
    </div>
  );
}

