'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { UserAvatar } from './UserAvatar';
import type { User } from '../lib/types';

interface ActiveTransaction {
  id: string;
  itemTitle: string;
  itemImage: string;
  otherUser: {
    userId: string;
    displayName: string;
    profilePicUrl: string;
  };
  role: 'lender' | 'borrower';
  borrowedStartDate: string;
  borrowedEndDate: string;
  feePaid: string;
  daysRemaining: number;
  status: 'on_time' | 'due_soon' | 'overdue';
}

interface ActiveTransactionsProps {
  currentUser: User;
  onMessageUser?: (userId: string, itemTitle: string) => void;
  onMarkReturned?: (transactionId: string) => void;
}

export function ActiveTransactions({
  currentUser,
  onMessageUser,
  onMarkReturned
}: ActiveTransactionsProps) {
  const [transactions, setTransactions] = useState<ActiveTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveTransactions();
  }, []);

  const loadActiveTransactions = async () => {
    setLoading(true);
    try {
      // Mock data - in production, this would fetch from smart contract
      const mockTransactions: ActiveTransaction[] = [
        {
          id: 'tx_1',
          itemTitle: 'Power Drill',
          itemImage: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=PD',
          otherUser: {
            userId: 'user_3',
            displayName: 'Carol Davis',
            profilePicUrl: 'https://via.placeholder.com/40x40/DC2626/FFFFFF?text=CD'
          },
          role: 'lender',
          borrowedStartDate: '2024-01-15',
          borrowedEndDate: '2024-01-17',
          feePaid: '0.0100',
          daysRemaining: 2,
          status: 'on_time'
        },
        {
          id: 'tx_2',
          itemTitle: 'Bluetooth Speaker',
          itemImage: 'https://via.placeholder.com/100x100/059669/FFFFFF?text=BS',
          otherUser: {
            userId: 'user_2',
            displayName: 'Bob Smith',
            profilePicUrl: 'https://via.placeholder.com/40x40/059669/FFFFFF?text=BS'
          },
          role: 'borrower',
          borrowedStartDate: '2024-01-12',
          borrowedEndDate: '2024-01-14',
          feePaid: '0.0140',
          daysRemaining: 0,
          status: 'due_soon'
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading active transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_time':
        return 'bg-green-50 border-green-200';
      case 'due_soon':
        return 'bg-yellow-50 border-yellow-200';
      case 'overdue':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string, daysRemaining: number) => {
    switch (status) {
      case 'on_time':
        return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
      case 'due_soon':
        return 'Due today';
      case 'overdue':
        return `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Active Transactions</h3>
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
      <h3 className="text-lg font-semibold text-text-primary">Active Transactions</h3>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">No active transactions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`border rounded-lg p-4 ${getStatusColor(transaction.status)}`}
            >
              <div className="flex gap-4">
                {/* Item Image */}
                <div className="flex-shrink-0">
                  <img
                    src={transaction.itemImage}
                    alt={transaction.itemTitle}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary truncate">
                        {transaction.itemTitle}
                      </h4>
                      <p className="text-sm text-text-secondary capitalize">
                        {transaction.role}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 ml-4">
                      <Clock className={`w-4 h-4 ${
                        transaction.status === 'overdue' ? 'text-red-500' :
                        transaction.status === 'due_soon' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        transaction.status === 'overdue' ? 'text-red-600' :
                        transaction.status === 'due_soon' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getStatusText(transaction.status, transaction.daysRemaining)}
                      </span>
                    </div>
                  </div>

                  {/* Other User */}
                  <div className="flex items-center gap-3 mt-3">
                    <UserAvatar
                      src={transaction.otherUser.profilePicUrl}
                      alt={transaction.otherUser.displayName}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {transaction.role === 'lender' ? 'Borrower' : 'Lender'}: {transaction.otherUser.displayName}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-3 text-sm">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <span>
                        {formatDate(transaction.borrowedStartDate)} - {formatDate(transaction.borrowedEndDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMessageUser?.(transaction.otherUser.userId, transaction.itemTitle)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>

                    {transaction.role === 'lender' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onMarkReturned?.(transaction.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Returned
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

