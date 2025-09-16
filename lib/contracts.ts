import { createPublicClient, createWalletClient, http, Address, formatEther, parseEther } from 'viem';
import { base } from 'viem/chains';
import { useMiniKit } from '@coinbase/minikit';

// Contract ABI - simplified for main functions
export const ITEM_REGISTRY_ABI = [
  // Item management
  {
    inputs: [
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_category', type: 'string' },
      { name: '_condition', type: 'string' },
      { name: '_imageUrl', type: 'string' },
      { name: '_lat', type: 'int256' },
      { name: '_lng', type: 'int256' },
      { name: '_borrowingFee', type: 'uint256' }
    ],
    name: 'listItem',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_itemId', type: 'uint256' }],
    name: 'items',
    outputs: [
      { name: 'itemId', type: 'uint256' },
      { name: 'lender', type: 'address' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'condition', type: 'string' },
      { name: 'imageUrl', type: 'string' },
      { name: 'isAvailable', type: 'bool' },
      { name: 'lat', type: 'int256' },
      { name: 'lng', type: 'int256' },
      { name: 'borrowingFee', type: 'uint256' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  // Borrow requests
  {
    inputs: [
      { name: '_itemId', type: 'uint256' },
      { name: '_startDate', type: 'uint256' },
      { name: '_endDate', type: 'uint256' },
      { name: '_message', type: 'string' }
    ],
    name: 'createBorrowRequest',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_requestId', type: 'uint256' }],
    name: 'borrowRequests',
    outputs: [
      { name: 'requestId', type: 'uint256' },
      { name: 'itemId', type: 'uint256' },
      { name: 'borrower', type: 'address' },
      { name: 'requestedStartDate', type: 'uint256' },
      { name: 'requestedEndDate', type: 'uint256' },
      { name: 'status', type: 'string' },
      { name: 'message', type: 'string' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_requestId', type: 'uint256' }],
    name: 'approveBorrowRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_requestId', type: 'uint256' }],
    name: 'denyBorrowRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Transactions
  {
    inputs: [{ name: '_requestId', type: 'uint256' }],
    name: 'createTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: '_transactionId', type: 'uint256' }],
    name: 'markItemReturned',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // View functions
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserItems',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserBorrowRequests',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserTransactions',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_itemId', type: 'uint256' }],
    name: 'getItemBorrowRequests',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Contract address - to be updated after deployment
export const ITEM_REGISTRY_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

// Create clients
export const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// Contract interaction functions
export class ItemRegistryContract {
  static async listItem(
    title: string,
    description: string,
    category: string,
    condition: string,
    imageUrl: string,
    lat: number,
    lng: number,
    borrowingFee: string // in ETH
  ) {
    const { wallet } = useMiniKit();

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const walletClient = createWalletClient({
      account: wallet.address as Address,
      chain: base,
      transport: http()
    });

    const feeInWei = parseEther(borrowingFee);
    const latFixed = Math.round(lat * 1000000); // Convert to fixed point
    const lngFixed = Math.round(lng * 1000000);

    const hash = await walletClient.writeContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'listItem',
      args: [title, description, category, condition, imageUrl, BigInt(latFixed), BigInt(lngFixed), feeInWei]
    });

    return hash;
  }

  static async getItem(itemId: number) {
    const item = await publicClient.readContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'items',
      args: [BigInt(itemId)]
    });

    return {
      itemId: Number(item[0]),
      lender: item[1] as Address,
      title: item[2] as string,
      description: item[3] as string,
      category: item[4] as string,
      condition: item[5] as string,
      imageUrl: item[6] as string,
      isAvailable: item[7] as boolean,
      lat: Number(item[8]) / 1000000, // Convert back from fixed point
      lng: Number(item[9]) / 1000000,
      borrowingFee: formatEther(item[10] as bigint),
      createdAt: Number(item[11]),
      updatedAt: Number(item[12])
    };
  }

  static async createBorrowRequest(
    itemId: number,
    startDate: Date,
    endDate: Date,
    message: string
  ) {
    const { wallet } = useMiniKit();

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const walletClient = createWalletClient({
      account: wallet.address as Address,
      chain: base,
      transport: http()
    });

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const hash = await walletClient.writeContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'createBorrowRequest',
      args: [BigInt(itemId), BigInt(startTimestamp), BigInt(endTimestamp), message]
    });

    return hash;
  }

  static async approveBorrowRequest(requestId: number) {
    const { wallet } = useMiniKit();

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const walletClient = createWalletClient({
      account: wallet.address as Address,
      chain: base,
      transport: http()
    });

    const hash = await walletClient.writeContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'approveBorrowRequest',
      args: [BigInt(requestId)]
    });

    return hash;
  }

  static async denyBorrowRequest(requestId: number) {
    const { wallet } = useMiniKit();

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const walletClient = createWalletClient({
      account: wallet.address as Address,
      chain: base,
      transport: http()
    });

    const hash = await walletClient.writeContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'denyBorrowRequest',
      args: [BigInt(requestId)]
    });

    return hash;
  }

  static async createTransaction(requestId: number, totalFee: string) {
    const { wallet } = useMiniKit();

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const walletClient = createWalletClient({
      account: wallet.address as Address,
      chain: base,
      transport: http()
    });

    const feeInWei = parseEther(totalFee);

    const hash = await walletClient.writeContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'createTransaction',
      args: [BigInt(requestId)],
      value: feeInWei
    });

    return hash;
  }

  static async markItemReturned(transactionId: number) {
    const { wallet } = useMiniKit();

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const walletClient = createWalletClient({
      account: wallet.address as Address,
      chain: base,
      transport: http()
    });

    const hash = await walletClient.writeContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'markItemReturned',
      args: [BigInt(transactionId)]
    });

    return hash;
  }

  static async getUserItems(userAddress: Address) {
    const itemIds = await publicClient.readContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'getUserItems',
      args: [userAddress]
    });

    return itemIds as bigint[];
  }

  static async getUserBorrowRequests(userAddress: Address) {
    const requestIds = await publicClient.readContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'getUserBorrowRequests',
      args: [userAddress]
    });

    return requestIds as bigint[];
  }

  static async getItemBorrowRequests(itemId: number) {
    const requestIds = await publicClient.readContract({
      address: ITEM_REGISTRY_ADDRESS,
      abi: ITEM_REGISTRY_ABI,
      functionName: 'getItemBorrowRequests',
      args: [BigInt(itemId)]
    });

    return requestIds as bigint[];
  }
}

// Utility functions
export function calculateBorrowingFee(dailyFee: string, startDate: Date, endDate: Date): string {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dailyFeeEth = parseFloat(dailyFee);
  const totalFee = dailyFeeEth * days;
  return totalFee.toString();
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function formatEthAmount(amount: string): string {
  return `${parseFloat(amount).toFixed(4)} ETH`;
}

