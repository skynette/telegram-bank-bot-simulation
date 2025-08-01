export interface Transaction {
  id: string;
  type: 'fund' | 'withdraw';
  amount: number;
  timestamp: Date;
  description: string;
}

export interface UserWallet {
  userId: number;
  balance: number;
  transactions: Transaction[];
}

export interface WalletStorage {
  [userId: number]: UserWallet;
}