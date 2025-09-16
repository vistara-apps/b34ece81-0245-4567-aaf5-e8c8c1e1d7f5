'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Star, MessageCircle, Calendar } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { TextArea } from './TextArea';
import { UserAvatar } from './UserAvatar';
import type { Item, User, BorrowRequest } from '../lib/types';

interface ItemDetailModalProps {
  item: Item;
  lender: User;
  currentUser: User;
  userLocation?: { lat: number; lng: number } | null;
  onClose: () => void;
}

export function ItemDetailModal({ 
  item, 
  lender, 
  currentUser, 
  userLocation, 
  onClose 
}: ItemDetailModalProps) {
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowRequest, setBorrowRequest] = useState({
    startDate: '',
    endDate: '',
    message: ''
  });

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

  const distance = userLocation 
    ? calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng)
    : null;

  const conditionColors = {
    excellent: 'text-green-600 bg-green-50',
    good: 'text-blue-600 bg-blue-50',
    fair: 'text-yellow-600 bg-yellow-50'
  };

  const isOwnItem = item.lenderUserId === currentUser.userId;

  const handleBorrowRequest = () => {
    // In a real app, this would make an API call
    console.log('Borrow request:', {
      itemId: item.itemId,
      borrowerUserId: currentUser.userId,
      ...borrowRequest
    });
    
    // Show success message and close
    alert('Borrow request sent! The lender will be notified.');
    onClose();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={item.title}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Item Image */}
        <div className="relative">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={600}
            height={300}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${conditionColors[item.condition]}`}>
            {item.condition}
          </div>
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-lg">Not Available</span>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">{item.title}</h2>
            <p className="text-text-secondary">{item.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary capitalize bg-gray-100 px-3 py-1 rounded-full">
              {item.category}
            </span>
            <span className="text-xl font-bold text-primary">{item.borrowingFee} ETH/day</span>
          </div>

          {distance && (
            <div className="flex items-center gap-2 text-text-secondary">
              <MapPin className="w-4 h-4" />
              <span>{distance.toFixed(1)} miles away</span>
            </div>
          )}
        </div>

        {/* Lender Info */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-text-primary mb-3">Lender</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar src={lender.profilePicUrl} alt={lender.displayName} size="md" />
              <div>
                <p className="font-medium text-text-primary">{lender.displayName}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-text-secondary">{lender.rating}</span>
                </div>
              </div>
            </div>
            
            {!isOwnItem && (
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            )}
          </div>
          
          {lender.bio && (
            <p className="text-sm text-text-secondary mt-2">{lender.bio}</p>
          )}
        </div>

        {/* Borrow Section */}
        {!isOwnItem && item.isAvailable && (
          <div className="border-t border-gray-200 pt-4">
            {!showBorrowForm ? (
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => setShowBorrowForm(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Request to Borrow
              </Button>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Borrow Request</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={borrowRequest.startDate}
                      onChange={(e) => setBorrowRequest(prev => ({ ...prev, startDate: e.target.value }))}
                      min={getTomorrowDate()}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={borrowRequest.endDate}
                      onChange={(e) => setBorrowRequest(prev => ({ ...prev, endDate: e.target.value }))}
                      min={borrowRequest.startDate || getTomorrowDate()}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <TextArea
                  label="Message to Lender (optional)"
                  value={borrowRequest.message}
                  onChange={(e) => setBorrowRequest(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Let the lender know how you'll use the item and when you can pick it up..."
                  rows={3}
                />

                <div className="flex gap-3">
                  <Button 
                    variant="primary" 
                    onClick={handleBorrowRequest}
                    disabled={!borrowRequest.startDate || !borrowRequest.endDate}
                    className="flex-1"
                  >
                    Send Request
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBorrowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {isOwnItem && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-text-secondary text-center">This is your item</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
