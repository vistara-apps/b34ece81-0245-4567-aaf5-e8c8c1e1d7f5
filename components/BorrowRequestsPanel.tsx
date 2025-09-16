'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/minikit';
import { RequestCard } from './RequestCard';
import { Button } from './Button';
import { Tabs } from './Tabs';
import type { BorrowRequest, Item, User } from '../lib/types';
import { mockItems, mockUsers, mockBorrowRequests } from '../lib/mockData';

interface BorrowRequestsPanelProps {
  onClose: () => void;
}

export function BorrowRequestsPanel({ onClose }: BorrowRequestsPanelProps) {
  const { wallet } = useMiniKit();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    loadRequests();
  }, [wallet, activeTab]);

  const loadRequests = async () => {
    if (!wallet) return;

    setLoading(true);
    try {
      // In production, this would fetch from the smart contract
      // For now, use mock data filtered by user
      let userRequests: BorrowRequest[] = [];

      if (activeTab === 'received') {
        // Requests received (user is lender)
        const userItems = mockItems.filter(item => item.lenderUserId === 'user_1'); // Mock user ID
        userRequests = mockBorrowRequests.filter(request =>
          userItems.some(item => item.itemId === request.itemId)
        );
      } else {
        // Requests sent (user is borrower)
        userRequests = mockBorrowRequests.filter(request =>
          request.borrowerUserId === 'user_1' // Mock user ID
        );
      }

      setRequests(userRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'deny') => {
    try {
      // In production, this would call the smart contract
      console.log(`${action} request ${requestId}`);

      // Update local state
      setRequests(prev =>
        prev.map(req =>
          req.requestId === requestId
            ? { ...req, status: action === 'approve' ? 'approved' : 'denied' }
            : req
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  const tabs = [
    { id: 'received', label: 'Received Requests', count: requests.filter(r => r.status === 'pending').length },
    { id: 'sent', label: 'Sent Requests', count: requests.length }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading requests...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">Borrow Requests</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as 'received' | 'sent')}
          />

          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">
                  {activeTab === 'received'
                    ? 'No borrow requests received yet'
                    : 'No borrow requests sent yet'
                  }
                </p>
              </div>
            ) : (
              requests.map(request => {
                const item = mockItems.find(i => i.itemId === request.itemId);
                const borrower = mockUsers.find(u => u.userId === request.borrowerUserId);
                const lender = item ? mockUsers.find(u => u.userId === item.lenderUserId) : null;

                if (!item || !borrower || !lender) return null;

                return (
                  <RequestCard
                    key={request.requestId}
                    request={request}
                    item={item}
                    borrower={borrower}
                    lender={lender}
                    isLender={activeTab === 'received'}
                    onApprove={() => handleRequestAction(request.requestId, 'approve')}
                    onDeny={() => handleRequestAction(request.requestId, 'deny')}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

