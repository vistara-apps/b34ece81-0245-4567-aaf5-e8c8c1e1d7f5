import type { User, Item, BorrowRequest } from './types';

export const mockUsers: User[] = [
  {
    userId: 'user_1',
    farcasterId: '9152',
    displayName: 'Alice Johnson',
    profilePicUrl: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=AJ',
    rating: 4.8,
    bio: 'Love sharing tools and helping neighbors!'
  },
  {
    userId: 'user_2',
    farcasterId: '9153',
    displayName: 'Bob Smith',
    profilePicUrl: 'https://via.placeholder.com/100x100/059669/FFFFFF?text=BS',
    rating: 4.9,
    bio: 'DIY enthusiast with lots of tools to share'
  },
  {
    userId: 'user_3',
    farcasterId: '9154',
    displayName: 'Carol Davis',
    profilePicUrl: 'https://via.placeholder.com/100x100/DC2626/FFFFFF?text=CD',
    rating: 4.7,
    bio: 'Bookworm and kitchen gadget collector'
  },
  {
    userId: 'user_4',
    farcasterId: '9155',
    displayName: 'David Wilson',
    profilePicUrl: 'https://via.placeholder.com/100x100/7C3AED/FFFFFF?text=DW',
    rating: 4.6,
    bio: 'Sports equipment and outdoor gear available'
  }
];

export const mockItems: Item[] = [
  {
    itemId: 'item_1',
    lenderUserId: 'user_1',
    title: 'Power Drill',
    description: 'Cordless power drill with various bits. Perfect for home improvement projects.',
    category: 'tools',
    condition: 'good',
    imageUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Power+Drill',
    isAvailable: true,
    lat: 37.7749,
    lng: -122.4194,
    borrowingFee: 0.005
  },
  {
    itemId: 'item_2',
    lenderUserId: 'user_2',
    title: 'Stand Mixer',
    description: 'KitchenAid stand mixer, great for baking. Includes dough hook and whisk.',
    category: 'kitchen',
    condition: 'excellent',
    imageUrl: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Stand+Mixer',
    isAvailable: true,
    lat: 37.7849,
    lng: -122.4094,
    borrowingFee: 0.008
  },
  {
    itemId: 'item_3',
    lenderUserId: 'user_3',
    title: 'Programming Books Set',
    description: 'Collection of JavaScript and React programming books. Great for learning!',
    category: 'books',
    condition: 'good',
    imageUrl: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Programming+Books',
    isAvailable: true,
    lat: 37.7649,
    lng: -122.4294,
    borrowingFee: 0.003
  },
  {
    itemId: 'item_4',
    lenderUserId: 'user_4',
    title: 'Tennis Racket',
    description: 'Professional tennis racket in excellent condition. Recently restrung.',
    category: 'sports',
    condition: 'excellent',
    imageUrl: 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=Tennis+Racket',
    isAvailable: true,
    lat: 37.7949,
    lng: -122.3994,
    borrowingFee: 0.006
  },
  {
    itemId: 'item_5',
    lenderUserId: 'user_1',
    title: 'Garden Hose',
    description: '50ft garden hose with spray nozzle. Perfect for watering plants.',
    category: 'garden',
    condition: 'good',
    imageUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Garden+Hose',
    isAvailable: true,
    lat: 37.7749,
    lng: -122.4194,
    borrowingFee: 0.004
  },
  {
    itemId: 'item_6',
    lenderUserId: 'user_2',
    title: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with great sound quality. Waterproof.',
    category: 'electronics',
    condition: 'excellent',
    imageUrl: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Bluetooth+Speaker',
    isAvailable: false,
    lat: 37.7849,
    lng: -122.4094,
    borrowingFee: 0.007
  }
];

export const mockBorrowRequests: BorrowRequest[] = [
  {
    requestId: 'req_1',
    itemId: 'item_1',
    borrowerUserId: 'user_3',
    requestedStartDate: '2024-01-15',
    requestedEndDate: '2024-01-17',
    status: 'pending',
    createdAt: '2024-01-14T10:00:00Z',
    message: 'Hi! I need this for a small home project. Will take good care of it!'
  }
];
