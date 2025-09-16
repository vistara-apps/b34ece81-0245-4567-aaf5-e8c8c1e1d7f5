# LendLocal Smart Contracts

## Overview

LendLocal uses smart contracts deployed on the Base network to handle item listings, borrow requests, and secure transactions. The contracts are built using Solidity and follow best practices for gas efficiency and security.

## Contract Architecture

### ItemRegistry.sol

The main contract that manages all item listings, borrow requests, and transactions.

#### Key Features

1. **Item Management**
   - List items for lending with location data
   - Update item details
   - Remove items (with safety checks)
   - Track item availability

2. **Borrow Request System**
   - Create borrow requests with dates and messages
   - Approve or deny requests
   - Track request status and history

3. **Transaction Management**
   - Secure escrow-based payments
   - Automatic fee distribution (platform + lender)
   - Return confirmations
   - Transaction status tracking

#### Contract Functions

##### Item Management
```solidity
function listItem(
    string memory _title,
    string memory _description,
    string memory _category,
    string memory _condition,
    string memory _imageUrl,
    int256 _lat,      // latitude * 10^6 for precision
    int256 _lng,      // longitude * 10^6 for precision
    uint256 _borrowingFee  // wei per day
) external returns (uint256)
```

```solidity
function updateItem(
    uint256 _itemId,
    string memory _title,
    string memory _description,
    string memory _category,
    string memory _condition,
    string memory _imageUrl,
    int256 _lat,
    int256 _lng,
    uint256 _borrowingFee
) external
```

```solidity
function removeItem(uint256 _itemId) external
```

##### Borrow Requests
```solidity
function createBorrowRequest(
    uint256 _itemId,
    uint256 _startDate,    // Unix timestamp
    uint256 _endDate,      // Unix timestamp
    string memory _message
) external returns (uint256)
```

```solidity
function approveBorrowRequest(uint256 _requestId) external
function denyBorrowRequest(uint256 _requestId) external
```

##### Transactions
```solidity
function createTransaction(uint256 _requestId) external payable
function markItemReturned(uint256 _transactionId) external
```

##### View Functions
```solidity
function getItem(uint256 _itemId) external view returns (Item memory)
function getBorrowRequest(uint256 _requestId) external view returns (BorrowRequest memory)
function getTransaction(uint256 _transactionId) external view returns (Transaction memory)
function getUserItems(address _user) external view returns (uint256[] memory)
function getUserBorrowRequests(address _user) external view returns (uint256[] memory)
function getItemBorrowRequests(uint256 _itemId) external view returns (uint256[] memory)
```

## Data Structures

### Item Struct
```solidity
struct Item {
    uint256 itemId;
    address lender;
    string title;
    string description;
    string category;
    string condition;     // "excellent", "good", "fair"
    string imageUrl;
    bool isAvailable;
    int256 lat;          // latitude * 10^6
    int256 lng;          // longitude * 10^6
    uint256 borrowingFee; // wei per day
    uint256 createdAt;
    uint256 updatedAt;
}
```

### BorrowRequest Struct
```solidity
struct BorrowRequest {
    uint256 requestId;
    uint256 itemId;
    address borrower;
    uint256 requestedStartDate;
    uint256 requestedEndDate;
    string status;       // "pending", "approved", "denied", "completed"
    string message;
    uint256 createdAt;
    uint256 updatedAt;
}
```

### Transaction Struct
```solidity
struct Transaction {
    uint256 transactionId;
    uint256 itemId;
    address lender;
    address borrower;
    uint256 borrowedStartDate;
    uint256 borrowedEndDate;
    uint256 returnedDate;  // 0 if not returned
    uint256 feePaid;       // total fee in wei
    string status;         // "active", "completed", "overdue"
    uint256 createdAt;
}
```

## Business Logic

### Fee Structure
- **Borrowing Fee**: Set by lender in wei per day
- **Platform Fee**: 5% of total transaction fee
- **Lender Cut**: 95% of total transaction fee

### Transaction Flow
1. **Item Listing**: Lender lists item with details and fee
2. **Borrow Request**: Borrower requests specific dates
3. **Approval**: Lender approves or denies request
4. **Payment**: Borrower pays total fee (escrowed in contract)
5. **Borrowing**: Item marked unavailable, transaction active
6. **Return**: Lender marks item as returned
7. **Completion**: Funds distributed, item available again

### Safety Features
- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Only item lenders can manage their items
- **Input Validation**: All inputs validated for safety
- **Emergency Pause**: Owner can pause contract in emergencies

## Gas Optimization

### Techniques Used
1. **Packing**: Struct fields ordered for optimal packing
2. **Events**: Efficient event logging for off-chain tracking
3. **View Functions**: Gas-free read operations
4. **Batch Operations**: Minimize external calls

### Estimated Gas Costs
- **List Item**: ~150,000 gas
- **Create Borrow Request**: ~120,000 gas
- **Approve Request**: ~80,000 gas
- **Create Transaction**: ~200,000 gas (includes payment)
- **Mark Returned**: ~100,000 gas

## Security Considerations

### Audit Status
- [ ] Contract audited by professional security firm
- [ ] OpenZeppelin contracts used for battle-tested components
- [ ] Comprehensive test suite implemented

### Known Risks
1. **Oracle Dependency**: Relies on block.timestamp for dates
2. **Location Precision**: Uses int256 for coordinates (sufficient precision)
3. **Fee Distribution**: Automatic distribution on transaction completion

### Mitigation Strategies
1. **Time-based Logic**: Use block.timestamp with reasonable tolerances
2. **Input Sanitization**: All string inputs length-limited
3. **Emergency Controls**: Owner can pause and withdraw funds if needed

## Deployment

### Prerequisites
- Base network RPC access
- Sufficient ETH for deployment and initial operations
- Contract ownership address with multi-sig setup

### Deployment Steps
1. **Test Deployment**: Deploy to Base Goerli testnet first
2. **Verification**: Verify contract source code on Basescan
3. **Testing**: Run comprehensive test suite
4. **Mainnet Deployment**: Deploy to Base mainnet
5. **Configuration**: Update frontend with deployed contract address

### Environment Variables
```bash
# Contract deployment
PRIVATE_KEY=your_private_key
RPC_URL=https://mainnet.base.org
CONTRACT_OWNER=your_owner_address

# Frontend configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=8453
```

## Monitoring

### Key Metrics to Track
- Total items listed
- Active transactions
- Platform fees collected
- User adoption rates
- Gas usage patterns

### Alerts
- Contract balance changes
- Unusual transaction volumes
- Failed transactions
- High gas usage

## Future Enhancements

### Potential Upgrades
1. **NFT Integration**: Make items into NFTs for better ownership tracking
2. **Insurance Module**: Optional insurance for high-value items
3. **Reputation System**: On-chain reputation scores
4. **Governance**: Token-based governance for platform decisions

### Scalability Considerations
1. **Layer 2 Optimization**: Leverage Base's low fees
2. **Batch Processing**: Group multiple operations
3. **Event-driven Architecture**: Use events for off-chain processing

