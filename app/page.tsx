'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/minikit';
import { AppShell } from '../components/AppShell';
import { ItemCard } from '../components/ItemCard';
import { SearchBar } from '../components/SearchBar';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ListItemForm } from '../components/ListItemForm';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { UserProfile } from '../components/UserProfile';
import { BorrowRequestsPanel } from '../components/BorrowRequestsPanel';
import { ChatInterface } from '../components/ChatInterface';
import { ReviewForm } from '../components/ReviewForm';
import { TransactionHistory } from '../components/TransactionHistory';
import { ActiveTransactions } from '../components/ActiveTransactions';
import { Tabs } from '../components/Tabs';
import { MessageCircle, ClipboardList, History } from 'lucide-react';
import { mockItems, mockUsers } from '../lib/mockData';
import type { Item, User } from '../lib/types';

export default function HomePage() {
  const { user } = useMiniKit();
  const [items, setItems] = useState<Item[]>(mockItems);
  const [filteredItems, setFilteredItems] = useState<Item[]>(mockItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // New state for additional features
  const [activeTab, setActiveTab] = useState<'browse' | 'requests' | 'transactions'>('browse');
  const [showBorrowRequests, setShowBorrowRequests] = useState(false);
  const [chatUser, setChatUser] = useState<{ user: User; itemTitle: string } | null>(null);
  const [reviewTransaction, setReviewTransaction] = useState<any>(null);

  // Initialize user and location
  useEffect(() => {
    // Set current user from MiniKit context or create mock user
    if (user) {
      const existingUser = mockUsers.find(u => u.farcasterId === user.fid?.toString());
      if (existingUser) {
        setCurrentUser(existingUser);
      } else {
        // Create new user from MiniKit data
        const newUser: User = {
          userId: `user_${Date.now()}`,
          farcasterId: user.fid?.toString() || '',
          displayName: user.displayName || 'Anonymous User',
          profilePicUrl: user.pfpUrl || '',
          rating: 5.0,
          bio: 'New to LendLocal!'
        };
        setCurrentUser(newUser);
      }
    } else {
      // Use mock user for development
      setCurrentUser(mockUsers[0]);
    }

    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Use default location (San Francisco)
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, [user]);

  // Filter items based on search and category
  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort by distance if location is available
    if (userLocation) {
      filtered = filtered.sort((a, b) => {
        const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distanceA - distanceB;
      });
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory, userLocation]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleAddItem = (newItem: Omit<Item, 'itemId' | 'lenderUserId' | 'lat' | 'lng'>) => {
    if (!currentUser || !userLocation) return;

    const item: Item = {
      ...newItem,
      itemId: `item_${Date.now()}`,
      lenderUserId: currentUser.userId,
      lat: userLocation.lat,
      lng: userLocation.lng,
    };

    setItems(prev => [item, ...prev]);
    setIsListModalOpen(false);
  };

  // New handlers
  const handleMessageUser = (userId: string, itemTitle: string) => {
    const otherUser = mockUsers.find(u => u.userId === userId);
    if (otherUser) {
      setChatUser({ user: otherUser, itemTitle });
    }
  };

  const handleReviewTransaction = (transaction: any) => {
    setReviewTransaction(transaction);
  };

  const handleSubmitReview = (review: any) => {
    console.log('Review submitted:', review);
    setReviewTransaction(null);
    // In production, this would save to backend
  };

  const handleMarkReturned = (transactionId: string) => {
    console.log('Marking transaction as returned:', transactionId);
    // In production, this would call smart contract
  };

  const categories = ['all', 'tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'other'];

  if (!currentUser) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your profile...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const mainTabs = [
    { id: 'browse', label: 'Browse Items', icon: null },
    { id: 'requests', label: 'Requests', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'transactions', label: 'My Transactions', icon: <History className="w-4 h-4" /> }
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">LendLocal</h1>
            <p className="text-text-secondary">Borrow and lend everyday items with your neighbors</p>
          </div>
          <UserProfile user={currentUser} />
        </div>

        {/* Main Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Actions */}
            <div className="space-y-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for items..."
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={() => setIsListModalOpen(true)}
                  className="ml-4"
                >
                  List Item
                </Button>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <ItemCard
                  key={item.itemId}
                  item={item}
                  lender={mockUsers.find(u => u.userId === item.lenderUserId)!}
                  userLocation={userLocation}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-text-secondary text-lg">No items found</p>
                <p className="text-text-secondary">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">Borrow Requests</h2>
              <Button
                variant="primary"
                onClick={() => setShowBorrowRequests(true)}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Manage Requests
              </Button>
            </div>

            <ActiveTransactions
              currentUser={currentUser!}
              onMessageUser={handleMessageUser}
              onMarkReturned={handleMarkReturned}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <TransactionHistory
              currentUser={currentUser!}
              onReviewTransaction={handleReviewTransaction}
              onMarkReturned={handleMarkReturned}
            />
          </div>
        )}

        {/* List Item Modal */}
        <Modal
          isOpen={isListModalOpen}
          onClose={() => setIsListModalOpen(false)}
          title="List an Item"
        >
          <ListItemForm
            onSubmit={handleAddItem}
            onCancel={() => setIsListModalOpen(false)}
          />
        </Modal>

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            lender={mockUsers.find(u => u.userId === selectedItem.lenderUserId)!}
            currentUser={currentUser}
            userLocation={userLocation}
            onClose={() => setSelectedItem(null)}
          />
        )}

        {/* Borrow Requests Panel */}
        {showBorrowRequests && (
          <BorrowRequestsPanel onClose={() => setShowBorrowRequests(false)} />
        )}

        {/* Chat Interface */}
        {chatUser && (
          <ChatInterface
            currentUser={currentUser!}
            otherUser={chatUser.user}
            itemTitle={chatUser.itemTitle}
            onClose={() => setChatUser(null)}
          />
        )}

        {/* Review Form */}
        {reviewTransaction && (
          <ReviewForm
            reviewer={currentUser!}
            reviewee={reviewTransaction.otherUser}
            itemTitle={reviewTransaction.itemTitle}
            transactionId={reviewTransaction.id}
            onSubmit={handleSubmitReview}
            onCancel={() => setReviewTransaction(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
