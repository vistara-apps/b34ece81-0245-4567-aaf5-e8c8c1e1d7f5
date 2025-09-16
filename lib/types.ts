export interface User {
  userId: string;
  farcasterId: string;
  displayName: string;
  profilePicUrl: string;
  rating: number;
  bio: string;
}

export interface Item {
  itemId: string;
  lenderUserId: string;
  title: string;
  description: string;
  category: string;
  condition: 'excellent' | 'good' | 'fair';
  imageUrl: string;
  isAvailable: boolean;
  lat: number;
  lng: number;
  borrowingFee: number; // in ETH
}

export interface BorrowRequest {
  requestId: string;
  itemId: string;
  borrowerUserId: string;
  requestedStartDate: string;
  requestedEndDate: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  createdAt: string;
  message?: string;
}

export interface Transaction {
  transactionId: string;
  itemId: string;
  lenderUserId: string;
  borrowerUserId: string;
  borrowedStartDate: string;
  returnedDate?: string;
  feePaid: number;
  status: 'active' | 'completed' | 'overdue';
  createdAt: string;
}

export type ItemCategory = 'tools' | 'electronics' | 'books' | 'sports' | 'kitchen' | 'garden' | 'other';

export type ItemCondition = 'excellent' | 'good' | 'fair';
