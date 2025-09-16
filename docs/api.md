# LendLocal API Documentation

## Overview

LendLocal is a Base MiniApp that enables peer-to-peer lending and borrowing of everyday items within local communities. This document outlines the APIs and integrations used in the application.

## Core Technologies

- **Framework**: Next.js 15 with TypeScript
- **Blockchain**: Base Network
- **Wallet Integration**: MiniKit SDK
- **Smart Contracts**: Solidity (OpenZeppelin)
- **Styling**: Tailwind CSS

## API Integrations

### 1. Farcaster Hub API

**Purpose**: Retrieve user profiles and social identity information for seamless onboarding.

**Base URL**: `https://api.farcaster.xyz`

**Key Endpoints**:
- `GET /v1/user/{fid}` - Get user profile by Farcaster ID
- `GET /v1/user/search?q={query}` - Search users by username/display name

**Authentication**: API key required (configured server-side)

**Rate Limits**: 100 requests per minute

**Usage in LendLocal**:
```typescript
// Fetch user profile for identity verification
const profile = await fetchFarcasterProfile(fid);
// Returns: { displayName, pfpUrl, bio, followerCount }
```

### 2. Base Network Smart Contracts

**Contract Address**: `0x0000000000000000000000000000000000000000` (to be deployed)

**Network**: Base Mainnet

**Key Functions**:

#### Item Management
```solidity
// List a new item for lending
function listItem(
    string memory _title,
    string memory _description,
    string memory _category,
    string memory _condition,
    string memory _imageUrl,
    int256 _lat,  // latitude * 10^6
    int256 _lng,  // longitude * 10^6
    uint256 _borrowingFee  // in wei per day
) external returns (uint256 itemId)
```

#### Borrow Requests
```solidity
// Create a borrow request
function createBorrowRequest(
    uint256 _itemId,
    uint256 _startDate,  // Unix timestamp
    uint256 _endDate,    // Unix timestamp
    string memory _message
) external returns (uint256 requestId)

// Approve/deny requests
function approveBorrowRequest(uint256 _requestId) external
function denyBorrowRequest(uint256 _requestId) external
```

#### Transactions
```solidity
// Create transaction (requires payment)
function createTransaction(uint256 _requestId) external payable

// Mark item as returned
function markItemReturned(uint256 _transactionId) external
```

### 3. Base Wallet/MiniKit SDK

**Purpose**: Handle wallet connection, transaction signing, and on-chain interactions.

**Key Features**:
- Wallet connection and disconnection
- Transaction signing and sending
- Balance checking
- Network switching

**Usage**:
```typescript
import { useMiniKit } from '@coinbase/minikit';

function MyComponent() {
  const { wallet, connectWallet, disconnectWallet } = useMiniKit();

  // Connect wallet
  const handleConnect = async () => {
    await connectWallet();
  };

  // Sign and send transaction
  const handleTransaction = async () => {
    const hash = await wallet.signAndSendTransaction({
      to: contractAddress,
      value: amount,
      data: encodedFunctionData
    });
  };
}
```

### 4. Location Services (Browser Geolocation API)

**Purpose**: Enable hyperlocal item discovery based on user location.

**API**: Standard browser Geolocation API

**Permissions Required**: User must grant location access

**Usage**:
```typescript
// Request user location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Use coordinates for item filtering
    },
    (error) => {
      console.log('Location access denied:', error);
    }
  );
}
```

## Data Models

### User
```typescript
interface User {
  userId: string;
  farcasterId: string;
  displayName: string;
  profilePicUrl: string;
  rating: number; // 1-5 stars
  bio: string;
}
```

### Item
```typescript
interface Item {
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
  borrowingFee: string; // ETH per day
}
```

### BorrowRequest
```typescript
interface BorrowRequest {
  requestId: string;
  itemId: string;
  borrowerUserId: string;
  requestedStartDate: string;
  requestedEndDate: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  message?: string;
}
```

### Transaction
```typescript
interface Transaction {
  transactionId: string;
  itemId: string;
  lenderUserId: string;
  borrowerUserId: string;
  borrowedStartDate: string;
  returnedDate?: string;
  feePaid: string; // ETH amount
  status: 'active' | 'completed' | 'overdue';
}
```

## Error Handling

### Common Error Codes

- `WALLET_NOT_CONNECTED`: User wallet not connected
- `INSUFFICIENT_BALANCE`: Not enough ETH for transaction
- `ITEM_NOT_AVAILABLE`: Item already borrowed
- `INVALID_DATES`: Borrow dates are invalid
- `LOCATION_DENIED`: User denied location access
- `NETWORK_ERROR`: Blockchain network issues

### Error Response Format
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}
```

## Security Considerations

1. **Smart Contract Audits**: All contracts should be audited before mainnet deployment
2. **Input Validation**: All user inputs validated on both client and contract levels
3. **Rate Limiting**: API calls rate-limited to prevent abuse
4. **Private Keys**: Never store or transmit private keys
5. **Transaction Signing**: All transactions require explicit user approval

## Deployment Checklist

- [ ] Deploy smart contracts to Base mainnet
- [ ] Update contract addresses in frontend
- [ ] Configure Farcaster API keys
- [ ] Set up production database (if needed)
- [ ] Configure monitoring and alerting
- [ ] Test all user flows end-to-end
- [ ] Perform security audit
- [ ] Set up CI/CD pipeline

## Support

For API-related issues or questions:
- Check the [Base Documentation](https://docs.base.org)
- Review [MiniKit SDK Docs](https://docs.base.org/base-app/build-with-minikit)
- Visit [Farcaster API Docs](https://docs.farcaster.xyz)

