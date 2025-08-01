import { Transaction, UserWallet, WalletStorage } from './types';

class WalletService {
  private wallets: WalletStorage = {};

  private generateTransactionId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private getOrCreateWallet(userId: number): UserWallet {
    if (!this.wallets[userId]) {
      this.wallets[userId] = {
        userId,
        balance: 0,
        transactions: []
      };
    }
    return this.wallets[userId];
  }

  getBalance(userId: number): number {
    const wallet = this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  fundWallet(userId: number, amount: number): { success: boolean; newBalance: number; message: string } {
    if (amount <= 0) {
      return {
        success: false,
        newBalance: 0,
        message: "Amount must be greater than 0"
      };
    }

    const wallet = this.getOrCreateWallet(userId);
    wallet.balance += amount;

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'fund',
      amount,
      timestamp: new Date(),
      description: `Wallet funded with $${amount.toFixed(2)}`
    };

    wallet.transactions.unshift(transaction);

    return {
      success: true,
      newBalance: wallet.balance,
      message: `Wallet funded with $${amount.toFixed(2)}. New balance: $${wallet.balance.toFixed(2)}`
    };
  }

  withdrawFromWallet(userId: number, amount: number): { success: boolean; newBalance: number; message: string } {
    if (amount <= 0) {
      return {
        success: false,
        newBalance: 0,
        message: "Amount must be greater than 0"
      };
    }

    const wallet = this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      return {
        success: false,
        newBalance: wallet.balance,
        message: "Insufficient funds"
      };
    }

    wallet.balance -= amount;

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'withdraw',
      amount,
      timestamp: new Date(),
      description: `Withdrew $${amount.toFixed(2)} from wallet`
    };

    wallet.transactions.unshift(transaction);

    return {
      success: true,
      newBalance: wallet.balance,
      message: `Successfully withdrew $${amount.toFixed(2)}. New balance: $${wallet.balance.toFixed(2)}`
    };
  }

  getTransactions(userId: number, limit: number = 5): Transaction[] {
    const wallet = this.getOrCreateWallet(userId);
    return wallet.transactions.slice(0, limit);
  }
}

export default new WalletService();