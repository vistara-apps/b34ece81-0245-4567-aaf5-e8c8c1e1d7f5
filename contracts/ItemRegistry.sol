// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ItemRegistry is Ownable, ReentrancyGuard {
    struct Item {
        uint256 itemId;
        address lender;
        string title;
        string description;
        string category;
        string condition; // "excellent", "good", "fair"
        string imageUrl;
        bool isAvailable;
        int256 lat; // latitude * 10^6 for precision
        int256 lng; // longitude * 10^6 for precision
        uint256 borrowingFee; // in wei per day
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct BorrowRequest {
        uint256 requestId;
        uint256 itemId;
        address borrower;
        uint256 requestedStartDate;
        uint256 requestedEndDate;
        string status; // "pending", "approved", "denied", "completed"
        string message;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Transaction {
        uint256 transactionId;
        uint256 itemId;
        address lender;
        address borrower;
        uint256 borrowedStartDate;
        uint256 borrowedEndDate;
        uint256 returnedDate;
        uint256 feePaid;
        string status; // "active", "completed", "overdue"
        uint256 createdAt;
    }

    // State variables
    mapping(uint256 => Item) public items;
    mapping(uint256 => BorrowRequest) public borrowRequests;
    mapping(uint256 => Transaction) public transactions;

    mapping(address => uint256[]) public userItems;
    mapping(address => uint256[]) public userBorrowRequests;
    mapping(address => uint256[]) public userTransactions;

    mapping(uint256 => uint256[]) public itemBorrowRequests;
    mapping(uint256 => uint256) public itemActiveTransaction;

    uint256 private nextItemId = 1;
    uint256 private nextRequestId = 1;
    uint256 private nextTransactionId = 1;

    uint256 public platformFee = 5; // 5% platform fee

    // Events
    event ItemListed(uint256 indexed itemId, address indexed lender, string title);
    event ItemUpdated(uint256 indexed itemId, address indexed lender);
    event ItemRemoved(uint256 indexed itemId, address indexed lender);

    event BorrowRequestCreated(uint256 indexed requestId, uint256 indexed itemId, address indexed borrower);
    event BorrowRequestApproved(uint256 indexed requestId, uint256 indexed itemId, address indexed lender);
    event BorrowRequestDenied(uint256 indexed requestId, uint256 indexed itemId, address indexed lender);

    event TransactionCreated(uint256 indexed transactionId, uint256 indexed itemId, address indexed borrower);
    event ItemReturned(uint256 indexed transactionId, uint256 indexed itemId, address indexed borrower);
    event TransactionCompleted(uint256 indexed transactionId, uint256 indexed itemId);

    // Modifiers
    modifier onlyItemLender(uint256 _itemId) {
        require(items[_itemId].lender == msg.sender, "Not the item lender");
        _;
    }

    modifier onlyRequestBorrower(uint256 _requestId) {
        require(borrowRequests[_requestId].borrower == msg.sender, "Not the request borrower");
        _;
    }

    modifier itemExists(uint256 _itemId) {
        require(items[_itemId].createdAt > 0, "Item does not exist");
        _;
    }

    modifier requestExists(uint256 _requestId) {
        require(borrowRequests[_requestId].createdAt > 0, "Request does not exist");
        _;
    }

    modifier transactionExists(uint256 _transactionId) {
        require(transactions[_transactionId].createdAt > 0, "Transaction does not exist");
        _;
    }

    // Item management functions
    function listItem(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _condition,
        string memory _imageUrl,
        int256 _lat,
        int256 _lng,
        uint256 _borrowingFee
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_borrowingFee > 0, "Borrowing fee must be greater than 0");

        uint256 itemId = nextItemId++;
        items[itemId] = Item({
            itemId: itemId,
            lender: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            condition: _condition,
            imageUrl: _imageUrl,
            isAvailable: true,
            lat: _lat,
            lng: _lng,
            borrowingFee: _borrowingFee,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        userItems[msg.sender].push(itemId);

        emit ItemListed(itemId, msg.sender, _title);
        return itemId;
    }

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
    ) external itemExists(_itemId) onlyItemLender(_itemId) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_borrowingFee > 0, "Borrowing fee must be greater than 0");

        Item storage item = items[_itemId];
        item.title = _title;
        item.description = _description;
        item.category = _category;
        item.condition = _condition;
        item.imageUrl = _imageUrl;
        item.lat = _lat;
        item.lng = _lng;
        item.borrowingFee = _borrowingFee;
        item.updatedAt = block.timestamp;

        emit ItemUpdated(_itemId, msg.sender);
    }

    function removeItem(uint256 _itemId) external itemExists(_itemId) onlyItemLender(_itemId) {
        require(itemActiveTransaction[_itemId] == 0, "Cannot remove item with active transaction");

        // Remove from user's items array
        uint256[] storage userItemList = userItems[msg.sender];
        for (uint256 i = 0; i < userItemList.length; i++) {
            if (userItemList[i] == _itemId) {
                userItemList[i] = userItemList[userItemList.length - 1];
                userItemList.pop();
                break;
            }
        }

        delete items[_itemId];
        emit ItemRemoved(_itemId, msg.sender);
    }

    // Borrow request functions
    function createBorrowRequest(
        uint256 _itemId,
        uint256 _startDate,
        uint256 _endDate,
        string memory _message
    ) external itemExists(_itemId) returns (uint256) {
        require(items[_itemId].isAvailable, "Item is not available");
        require(items[_itemId].lender != msg.sender, "Cannot borrow your own item");
        require(_startDate > block.timestamp, "Start date must be in the future");
        require(_endDate > _startDate, "End date must be after start date");

        uint256 requestId = nextRequestId++;
        borrowRequests[requestId] = BorrowRequest({
            requestId: requestId,
            itemId: _itemId,
            borrower: msg.sender,
            requestedStartDate: _startDate,
            requestedEndDate: _endDate,
            status: "pending",
            message: _message,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        userBorrowRequests[msg.sender].push(requestId);
        itemBorrowRequests[_itemId].push(requestId);

        emit BorrowRequestCreated(requestId, _itemId, msg.sender);
        return requestId;
    }

    function approveBorrowRequest(uint256 _requestId) external requestExists(_requestId) {
        BorrowRequest storage request = borrowRequests[_requestId];
        require(items[request.itemId].lender == msg.sender, "Not the item lender");
        require(keccak256(bytes(request.status)) == keccak256(bytes("pending")), "Request not pending");

        request.status = "approved";
        request.updatedAt = block.timestamp;

        // Mark item as unavailable
        items[request.itemId].isAvailable = false;

        emit BorrowRequestApproved(_requestId, request.itemId, msg.sender);
    }

    function denyBorrowRequest(uint256 _requestId) external requestExists(_requestId) {
        BorrowRequest storage request = borrowRequests[_requestId];
        require(items[request.itemId].lender == msg.sender, "Not the item lender");
        require(keccak256(bytes(request.status)) == keccak256(bytes("pending")), "Request not pending");

        request.status = "denied";
        request.updatedAt = block.timestamp;

        emit BorrowRequestDenied(_requestId, request.itemId, msg.sender);
    }

    // Transaction functions
    function createTransaction(uint256 _requestId) external payable requestExists(_requestId) {
        BorrowRequest storage request = borrowRequests[_requestId];
        require(request.borrower == msg.sender, "Not the request borrower");
        require(keccak256(bytes(request.status)) == keccak256(bytes("approved")), "Request not approved");

        Item storage item = items[request.itemId];
        uint256 duration = (request.requestedEndDate - request.requestedStartDate) / 86400 + 1; // days
        uint256 totalFee = item.borrowingFee * duration;
        uint256 platformCut = (totalFee * platformFee) / 100;
        uint256 lenderCut = totalFee - platformCut;

        require(msg.value >= totalFee, "Insufficient payment");

        uint256 transactionId = nextTransactionId++;
        transactions[transactionId] = Transaction({
            transactionId: transactionId,
            itemId: request.itemId,
            lender: item.lender,
            borrower: msg.sender,
            borrowedStartDate: request.requestedStartDate,
            borrowedEndDate: request.requestedEndDate,
            returnedDate: 0,
            feePaid: totalFee,
            status: "active",
            createdAt: block.timestamp
        });

        // Update request status
        request.status = "completed";
        request.updatedAt = block.timestamp;

        // Set active transaction for item
        itemActiveTransaction[request.itemId] = transactionId;

        // Add to user transactions
        userTransactions[msg.sender].push(transactionId);
        userTransactions[item.lender].push(transactionId);

        // Transfer funds
        payable(item.lender).transfer(lenderCut);
        payable(owner()).transfer(platformCut);

        // Refund excess payment
        if (msg.value > totalFee) {
            payable(msg.sender).transfer(msg.value - totalFee);
        }

        emit TransactionCreated(transactionId, request.itemId, msg.sender);
    }

    function markItemReturned(uint256 _transactionId) external transactionExists(_transactionId) {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.lender == msg.sender, "Not the item lender");
        require(keccak256(bytes(transaction.status)) == keccak256(bytes("active")), "Transaction not active");

        transaction.returnedDate = block.timestamp;
        transaction.status = "completed";

        // Mark item as available again
        items[transaction.itemId].isAvailable = true;
        delete itemActiveTransaction[transaction.itemId];

        emit ItemReturned(_transactionId, transaction.itemId, transaction.borrower);
        emit TransactionCompleted(_transactionId, transaction.itemId);
    }

    // View functions
    function getItem(uint256 _itemId) external view returns (Item memory) {
        return items[_itemId];
    }

    function getBorrowRequest(uint256 _requestId) external view returns (BorrowRequest memory) {
        return borrowRequests[_requestId];
    }

    function getTransaction(uint256 _transactionId) external view returns (Transaction memory) {
        return transactions[_transactionId];
    }

    function getUserItems(address _user) external view returns (uint256[] memory) {
        return userItems[_user];
    }

    function getUserBorrowRequests(address _user) external view returns (uint256[] memory) {
        return userBorrowRequests[_user];
    }

    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }

    function getItemBorrowRequests(uint256 _itemId) external view returns (uint256[] memory) {
        return itemBorrowRequests[_itemId];
    }

    function getItemActiveTransaction(uint256 _itemId) external view returns (uint256) {
        return itemActiveTransaction[_itemId];
    }

    // Admin functions
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 20, "Platform fee cannot exceed 20%");
        platformFee = _fee;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Emergency functions
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause would go here
    }
}

