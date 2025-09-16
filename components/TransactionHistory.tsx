'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { UserAvatar } from './UserAvatar';
import { Tabs } from './Tabs';
import type { User } from '../lib/types';

interface Transaction {
  id: string;
  itemTitle: string;
  itemImage: string;
  otherUser: {
    userId: string;
    displayName: string;
    profilePicUrl: string;
  };
  role: 'lender' | 'borrower';
  status: 'active' | 'completed' | 'overdue';
  borrowedStartDate: string;
  returnedDate?: string;
  feePaid: string;
  createdAt: string;
}

interface TransactionHistoryProps {
  currentUser: User;
  onReviewTransaction?: (transaction: Transaction) => void;
  onMarkReturned?: (transactionId: string) => void;
}

export function TransactionHistory({
  currentUser,
  onReviewTransaction,
  onMarkReturned
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    loadTransactions();
  }, [activeTab]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Mock data - in production, this would fetch from smart contract
      const mockTransactions: Transaction[] = [
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
          status: 'active',
          borrowedStartDate: '2024-01-15',
          feePaid: '0.0100',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'tx_2',
          itemTitle: 'Stand Mixer',
          itemImage: 'https://via.placeholder.com/100x100/059669/FFFFFF?text=SM',
          otherUser: {
            userId: 'user_2',
            displayName: 'Bob Smith',
            profilePicUrl: 'https://via.placeholder.com/40x40/059669/FFFFFF?text=BS'
          },
          role: 'borrower',
          status: 'completed',
          borrowedStartDate: '2024-01-10',
          returnedDate: '2024-01-12',
          feePaid: '0.0160',
          createdAt: '2024-01-09T14:30:00Z'
        },
        {
          id: 'tx_3',
          itemTitle: 'Tennis Racket',
          itemImage: 'https://via.placeholder.com/100x100/7C3AED/FFFFFF?text=TR',
          otherUser: {
            userId: 'user_4',
            displayName: 'David Wilson',
            profilePicUrl: 'https://via.placeholder.com/40x40/7C3AED/FFFFFF?text=DW'
          },
          role: 'borrower',
          status: 'completed',
          borrowedStartDate: '2024-01-08',
          returnedDate: '2024-01-09',
          feePaid: '0.0120',
          createdAt: '2024-01-07T09:15:00Z'
        }
      ];

      const filteredTransactions = mockTransactions.filter(tx =>
        activeTab === 'active' ? tx.status === 'active' : tx.status === 'completed'
      );

      setTransactions(filteredTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'overdue':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const tabs = [
    { id: 'active', label: 'Active', count: transactions.filter(t => t.status === 'active').length },
    { id: 'completed', label: 'Completed', count: transactions.filter(t => t.status === 'completed').length }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Transaction History</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
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
      <h3 className="text-lg font-semibold text-text-primary">Transaction History</h3>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'active' | 'completed')}
      />

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">
              No {activeTab} transactions yet
            </p>
          </div>
        ) : (
          transactions.map((transaction) => (
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

                    {/* Status */}
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusIcon(transaction.status)}
                      <span className="text-sm font-medium capitalize">
                        {transaction.status}
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
                      <p className="text-xs text-text-secondary">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Dates and Fee */}
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-secondary" />
                      <div>
                        <p className="text-text-primary">
                          {formatDate(transaction.borrowedStartDate)}
                          {transaction.returnedDate && ` - ${formatDate(transaction.returnedDate)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-text-secondary" />
                      <span className="font-medium text-primary">
                        {transaction.feePaid} ETH
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    {transaction.status === 'active' && transaction.role === 'lender' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onMarkReturned?.(transaction.id)}
                      >
                        Mark as Returned
                      </Button>
                    )}

                    {transaction.status === 'completed' && !transaction.returnedDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReviewTransaction?.(transaction)}
                      >
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

