# LendLocal Integration Guide

## Overview

This guide covers the integration of LendLocal's frontend with various APIs and services, including smart contracts, wallet connections, and external data sources.

## Frontend Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks + local state
- **Blockchain**: Viem + Wagmi
- **Wallet**: MiniKit SDK

### Key Components

#### Providers Setup
```typescript
// app/providers.tsx
'use client';

import { MiniKitProvider } from '@coinbase/minikit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http()
  }
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniKitProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </MiniKitProvider>
  );
}
```

#### Contract Integration
```typescript
// lib/contracts.ts
import { createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// Contract interaction functions
export class ItemRegistryContract {
  static async listItem(itemData: ItemInput) {
    // Implementation
  }

  static async getItem(itemId: number) {
    // Implementation
  }
}
```

## MiniKit Integration

### Wallet Connection
```typescript
'use client';

import { useMiniKit } from '@coinbase/minikit';

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useMiniKit();

  if (!wallet) {
    return (
      <button onClick={connectWallet}>
        Connect Base Wallet
      </button>
    );
  }

  return (
    <div>
      <p>Connected: {wallet.address}</p>
      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  );
}
```

### Transaction Signing
```typescript
import { useMiniKit } from '@coinbase/minikit';
import { ItemRegistryContract } from '../lib/contracts';

export function ListItemButton({ itemData }) {
  const { wallet } = useMiniKit();

  const handleListItem = async () => {
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const hash = await ItemRegistryContract.listItem(itemData);
      console.log('Transaction hash:', hash);

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });

      alert('Item listed successfully!');
    } catch (error) {
      console.error('Error listing item:', error);
      alert('Failed to list item');
    }
  };

  return (
    <button onClick={handleListItem}>
      List Item
    </button>
  );
}
```

## Farcaster Integration

### User Profile Fetching
```typescript
// lib/farcaster.ts
const FARCASTER_API_BASE = 'https://api.farcaster.xyz/v1';

export async function getUserProfile(fid: number) {
  const response = await fetch(`${FARCASTER_API_BASE}/user/${fid}`, {
    headers: {
      'Authorization': `Bearer ${process.env.FARCASTER_API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

export async function searchUsers(query: string) {
  const response = await fetch(
    `${FARCASTER_API_BASE}/user/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.FARCASTER_API_KEY}`
      }
    }
  );

  return response.json();
}
```

### Profile Integration in Components
```typescript
// components/UserProfile.tsx
'use client';

import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/minikit';
import { getUserProfile } from '../lib/farcaster';

export function UserProfile() {
  const { user } = useMiniKit();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.fid) {
      getUserProfile(user.fid).then(setProfile);
    }
  }, [user?.fid]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="flex items-center gap-3">
      <img
        src={profile.pfpUrl}
        alt={profile.displayName}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-medium">{profile.displayName}</p>
        <p className="text-sm text-gray-600">@{profile.username}</p>
      </div>
    </div>
  );
}
```

## Location Services Integration

### Geolocation API Usage
```typescript
// lib/location.ts
export function requestLocationPermission(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### Location-based Item Filtering
```typescript
// components/ItemList.tsx
'use client';

import { useEffect, useState } from 'react';
import { requestLocationPermission, calculateDistance } from '../lib/location';

export function ItemList({ items }) {
  const [userLocation, setUserLocation] = useState(null);
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    requestLocationPermission()
      .then(coords => {
        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude
        });
      })
      .catch(error => {
        console.log('Location access denied:', error);
        // Use default location or show items without distance sorting
      });
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const sorted = [...items].sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });

    setFilteredItems(sorted);
  }, [items, userLocation]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          distance={userLocation ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            item.lat,
            item.lng
          ) : null}
        />
      ))}
    </div>
  );
}
```

## Error Handling

### Global Error Boundary
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            Please refresh the page and try again.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// lib/api.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other error
    throw new ApiError(
      'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}
```

## Environment Configuration

### Environment Variables
```bash
# .env.local
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=8453

# API Keys
FARCASTER_API_KEY=your_farcaster_api_key
NEXT_PUBLIC_FARCASTER_CLIENT_ID=your_client_id

# App Configuration
NEXT_PUBLIC_APP_NAME=LendLocal
NEXT_PUBLIC_APP_URL=https://lendlocal.vercel.app
```

### Configuration Object
```typescript
// lib/config.ts
export const config = {
  contract: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453')
  },
  farcaster: {
    apiKey: process.env.FARCASTER_API_KEY!,
    clientId: process.env.NEXT_PUBLIC_FARCASTER_CLIENT_ID!
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'LendLocal',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
};
```

## Testing Integration

### Unit Tests
```typescript
// __tests__/contracts.test.ts
import { ItemRegistryContract } from '../lib/contracts';

describe('ItemRegistryContract', () => {
  it('should list an item', async () => {
    const mockItem = {
      title: 'Test Item',
      description: 'Test description',
      category: 'tools',
      condition: 'good',
      imageUrl: 'https://example.com/image.jpg',
      lat: 37.7749,
      lng: -122.4194,
      borrowingFee: '0.01'
    };

    // Mock the contract call
    const result = await ItemRegistryContract.listItem(mockItem);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// __tests__/integration.test.ts
describe('LendLocal Flow', () => {
  it('should complete full borrow flow', async () => {
    // 1. List item
    // 2. Create borrow request
    // 3. Approve request
    // 4. Create transaction
    // 5. Mark as returned
    // 6. Leave review
  });
});
```

## Deployment

### Build Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  },
  images: {
    domains: ['via.placeholder.com', 'example.com'],
  },
};

export default nextConfig;
```

### Vercel Deployment
```json
// vercel.json
{
  "env": {
    "CONTRACT_ADDRESS": "@contract-address",
    "FARCASTER_API_KEY": "@farcaster-api-key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

## Monitoring and Analytics

### Error Tracking
```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

export function initErrorTracking() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

export function captureError(error: Error, context?: any) {
  Sentry.captureException(error, {
    tags: {
      component: 'lendlocal',
    },
    extra: context,
  });
}
```

### Performance Monitoring
```typescript
// lib/performance.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Send to analytics service
  console.log('Event:', eventName, properties);
}

export function trackTransaction(transactionId: string, action: string) {
  trackEvent('transaction', {
    transactionId,
    action,
    timestamp: Date.now()
  });
}
```

