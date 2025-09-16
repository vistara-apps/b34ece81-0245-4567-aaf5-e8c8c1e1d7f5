'use client';

import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { Item, User } from '../lib/types';

interface ItemCardProps {
  item: Item;
  lender: User;
  userLocation?: { lat: number; lng: number } | null;
  onClick: () => void;
}

export function ItemCard({ item, lender, userLocation, onClick }: ItemCardProps) {
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

  return (
    <div 
      className="card cursor-pointer hover:shadow-lg transition-shadow duration-200 animate-fade-in"
      onClick={onClick}
    >
      <div className="relative mb-3">
        <Image
          src={item.imageUrl}
          alt={item.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover rounded-md"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
            <span className="text-white font-medium">Not Available</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${conditionColors[item.condition]}`}>
          {item.condition}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary text-lg">{item.title}</h3>
          <p className="text-text-secondary text-sm line-clamp-2">{item.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar src={lender.profilePicUrl} alt={lender.displayName} size="sm" />
            <div>
              <p className="text-sm font-medium text-text-primary">{lender.displayName}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs text-text-secondary">{lender.rating}</span>
              </div>
            </div>
          </div>
          
          {distance && (
            <div className="flex items-center gap-1 text-text-secondary">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{distance.toFixed(1)} mi</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-text-secondary capitalize">{item.category}</span>
          <span className="font-semibold text-primary">{item.borrowingFee} ETH/day</span>
        </div>
      </div>
    </div>
  );
}
