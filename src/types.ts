// Single transaction record - keeps track of all money movements
export interface Transaction {
  id: string;
  type: 'fund' | 'withdraw';
  amount: number;
  timestamp: Date;
  description: string;
}

// Each user's wallet data - think of this as their account
export interface UserWallet {
  userId: number;  // Telegram user ID
  balance: number;
  transactions: Transaction[];
}

// Storage for all user wallets - using user ID as the key for quick lookups
export interface WalletStorage {
  [userId: number]: UserWallet;
}

// Tracks when a user starts an interactive command but hasn't entered the amount yet
export interface UserSession {
  userId: number;
  pendingAction: 'fund' | 'withdraw' | null;
  timestamp: Date;  // Used to expire old sessions
}

// Storage for all active user sessions
export interface SessionStorage {
  [userId: number]: UserSession;
}