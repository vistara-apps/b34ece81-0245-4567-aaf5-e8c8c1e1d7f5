'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from './Button';
import { UserAvatar } from './UserAvatar';
import type { BorrowRequest, Item, User } from '../lib/types';

interface RequestCardProps {
  request: BorrowRequest;
  item: Item;
  borrower: User;
  lender: User;
  isLender: boolean;
  onApprove: () => void;
  onDeny: () => void;
}

export function RequestCard({
  request,
  item,
  borrower,
  lender,
  isLender,
  onApprove,
  onDeny
}: RequestCardProps) {
  const [showMessage, setShowMessage] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    const start = new Date(request.requestedStartDate);
    const end = new Date(request.requestedEndDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const calculateTotalFee = () => {
    const duration = calculateDuration();
    const dailyFee = parseFloat(item.borrowingFee);
    return (dailyFee * duration).toFixed(4);
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (request.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'denied':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex gap-4">
        {/* Item Image */}
        <div className="flex-shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={80}
            height={60}
            className="w-20 h-15 object-cover rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
              <p className="text-sm text-text-secondary capitalize">{item.category}</p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 ml-4">
              {getStatusIcon()}
              <span className="text-sm font-medium capitalize">{request.status}</span>
            </div>
          </div>

          {/* Borrower/Lender Info */}
          <div className="mt-3 flex items-center gap-3">
            <UserAvatar src={borrower.profilePicUrl} alt={borrower.displayName} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                {isLender ? 'From' : 'To'}: {borrower.displayName}
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < Math.floor(borrower.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-xs text-text-secondary ml-1">{borrower.rating}</span>
              </div>
            </div>
          </div>

          {/* Dates and Fee */}
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-secondary" />
              <div>
                <p className="text-text-primary">
                  {formatDate(request.requestedStartDate)} - {formatDate(request.requestedEndDate)}
                </p>
                <p className="text-text-secondary">
                  {calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-primary">{calculateTotalFee()} ETH</p>
              <p className="text-text-secondary">{item.borrowingFee} ETH/day</p>
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div className="mt-3">
              <button
                onClick={() => setShowMessage(!showMessage)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
              >
                <MessageCircle className="w-4 h-4" />
                {showMessage ? 'Hide message' : 'Show message'}
              </button>
              {showMessage && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-text-primary">"{request.message}"</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {isLender && request.status === 'pending' && (
            <div className="mt-4 flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={onApprove}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeny}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deny
              </Button>
            </div>
          )}

          {!isLender && request.status === 'approved' && (
            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Handle payment and transaction creation
                  console.log('Proceed to payment for request:', request.requestId);
                }}
              >
                Proceed to Payment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

