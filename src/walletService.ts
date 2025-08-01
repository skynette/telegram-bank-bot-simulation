import { Transaction, UserWallet, WalletStorage, UserSession, SessionStorage } from './types';

// Core service that handles all wallet operations - this is where the money magic happens
class WalletService {
  private wallets: WalletStorage = {};    // All user wallets live here
  private sessions: SessionStorage = {};  // Tracks users in interactive mode

  // Quick and dirty unique ID generator - good enough for our demo
  private generateTransactionId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Gets existing wallet or creates a new one with zero balance
  // This way new users don't need to "sign up" - they just start using it
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

  // Adds money to wallet - returns a result object so the bot knows what to tell the user
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

    wallet.transactions.unshift(transaction);  // unshift adds to front, so newest transactions appear first

    return {
      success: true,
      newBalance: wallet.balance,
      message: `Wallet funded with $${amount.toFixed(2)}. New balance: $${wallet.balance.toFixed(2)}`
    };
  }

  // Takes money out - checks for sufficient funds first (no overdrafts in this bank!)
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

    wallet.transactions.unshift(transaction);  // unshift adds to front, so newest transactions appear first

    return {
      success: true,
      newBalance: wallet.balance,
      message: `Successfully withdrew $${amount.toFixed(2)}. New balance: $${wallet.balance.toFixed(2)}`
    };
  }

  // Gets recent transactions - defaults to 5 but you can ask for more
  getTransactions(userId: number, limit: number = 5): Transaction[] {
    const wallet = this.getOrCreateWallet(userId);
    return wallet.transactions.slice(0, limit);
  }

  // When user types /fund or /withdraw without amount, we remember what they're trying to do
  setPendingAction(userId: number, action: 'fund' | 'withdraw'): void {
    this.sessions[userId] = {
      userId,
      pendingAction: action,
      timestamp: new Date()
    };
  }

  // Checks what action user is in the middle of - auto-expires after 5 minutes
  getPendingAction(userId: number): 'fund' | 'withdraw' | null {
    const session = this.sessions[userId];
    if (!session) return null;

    const now = new Date();
    const sessionAge = (now.getTime() - session.timestamp.getTime()) / 1000 / 60;  // age in minutes
    
    // Clean up stale sessions
    if (sessionAge > 5) {
      delete this.sessions[userId];
      return null;
    }

    return session.pendingAction;
  }

  clearPendingAction(userId: number): void {
    delete this.sessions[userId];
  }
}

// Export a singleton instance - all parts of the app share the same wallet service
export default new WalletService();