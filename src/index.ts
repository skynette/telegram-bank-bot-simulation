import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import * as dotenv from 'dotenv';
import walletService from './walletService';

// Load environment variables from .env file
dotenv.config();

// Create bot instance - the exclamation mark tells TypeScript we're sure the token exists
const bot = new Telegraf(process.env.BOT_TOKEN!);

// /start command - first thing users see when they open your bot
bot.start((ctx: Context) => {
  const welcomeMessage = `
🎉 Welcome to Wallet Bot! 🎉

I'm here to help you manage your virtual wallet. Here's what I can do:

💰 /balance - Check your current wallet balance
💵 /fund <amount> or /fund - Add money to your wallet
💸 /withdraw <amount> or /withdraw - Withdraw money from your wallet
📊 /transactions - View your last 5 transactions

This is a simulation bot - no real money is involved! 
Just type any command to get started.

Example: /fund 100
  `;
  
  ctx.reply(welcomeMessage);
});

// /balance - shows how much money user has
bot.command('balance', (ctx: Context) => {
  try {
    const userId = ctx.from?.id;  // ctx.from contains info about the user who sent the message
    if (!userId) {
      ctx.reply('❌ Unable to identify user.');
      return;
    }

    const balance = walletService.getBalance(userId);
    ctx.reply(`💰 Your wallet balance is $${balance.toFixed(2)}`);
  } catch (error) {
    console.error('Error in balance command:', error);
    ctx.reply('❌ An error occurred while checking your balance.');
  }
});

// /fund - adds money to wallet, works two ways: /fund 100 or just /fund
bot.command('fund', (ctx: Context) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) {
      ctx.reply('❌ Unable to identify user.');
      return;
    }

    // Extract the command text safely - Telegram sends different message types
    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const args = messageText.split(' ');  // Split to check if amount was provided
    
    if (args.length < 2) {
      // No amount provided - switch to interactive mode
      walletService.setPendingAction(userId, 'fund');
      ctx.reply('💵 How much would you like to fund your wallet?\n\nPlease enter the amount (e.g., 50, 100.50):');
      return;
    }

    const amount = parseFloat(args[1]);
    
    if (isNaN(amount) || amount <= 0) {
      ctx.reply('❌ Please enter a valid positive amount.\nExample: /fund 50');
      return;
    }

    if (amount > 10000) {
      ctx.reply('❌ Maximum funding amount is $10,000 per transaction.');
      return;
    }

    const result = walletService.fundWallet(userId, amount);
    
    if (result.success) {
      ctx.reply(`✅ ${result.message}`);
    } else {
      ctx.reply(`❌ ${result.message}`);
    }
  } catch (error) {
    console.error('Error in fund command:', error);
    ctx.reply('❌ An error occurred while funding your wallet.');
  }
});

// /withdraw - takes money out, also supports both direct and interactive modes
bot.command('withdraw', (ctx: Context) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) {
      ctx.reply('❌ Unable to identify user.');
      return;
    }

    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const args = messageText.split(' ');
    
    if (args.length < 2) {
      // Interactive mode - show current balance to help user decide
      const currentBalance = walletService.getBalance(userId);
      walletService.setPendingAction(userId, 'withdraw');
      ctx.reply(`💸 How much would you like to withdraw?\n\nYour current balance: $${currentBalance.toFixed(2)}\nPlease enter the amount (e.g., 25, 50.75):`);
      return;
    }

    const amount = parseFloat(args[1]);
    
    if (isNaN(amount) || amount <= 0) {
      ctx.reply('❌ Please enter a valid positive amount.\nExample: /withdraw 25');
      return;
    }

    const result = walletService.withdrawFromWallet(userId, amount);
    
    if (result.success) {
      ctx.reply(`✅ ${result.message}`);
    } else {
      ctx.reply(`❌ ${result.message}`);
    }
  } catch (error) {
    console.error('Error in withdraw command:', error);
    ctx.reply('❌ An error occurred while processing your withdrawal.');
  }
});

// /transactions - shows recent money movements
bot.command('transactions', (ctx: Context) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) {
      ctx.reply('❌ Unable to identify user.');
      return;
    }

    const transactions = walletService.getTransactions(userId, 5);
    
    if (transactions.length === 0) {
      ctx.reply('📝 You have not made any transactions yet.');
      return;
    }

    let transactionsList = '📊 Your last 5 transactions:\n\n';
    
    // Build a nice formatted list of transactions
    transactions.forEach((transaction, index) => {
      const emoji = transaction.type === 'fund' ? '💵' : '💸';
      const sign = transaction.type === 'fund' ? '+' : '-';
      const date = transaction.timestamp.toLocaleDateString();
      const time = transaction.timestamp.toLocaleTimeString();
      
      transactionsList += `${emoji} ${sign}$${transaction.amount.toFixed(2)}\n`;
      transactionsList += `   ${transaction.description}\n`;
      transactionsList += `   ${date} at ${time}\n\n`;
    });

    ctx.reply(transactionsList);
  } catch (error) {
    console.error('Error in transactions command:', error);
    ctx.reply('❌ An error occurred while fetching your transactions.');
  }
});

// This catches all text messages that aren't commands (no slash)
// Used for interactive mode when user enters amounts
bot.on('text', (ctx: Context) => {
  const message = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
  const userId = ctx.from?.id;
  
  if (!userId) {
    ctx.reply('❌ Unable to identify user.');
    return;
  }
  
  if (!message.startsWith('/')) {
    // Check if user is in the middle of an interactive command
    const pendingAction = walletService.getPendingAction(userId);
    
    if (pendingAction) {
      const amount = parseFloat(message.trim());
      
      if (isNaN(amount) || amount <= 0) {
        ctx.reply('❌ Please enter a valid positive number.\nExample: 50 or 100.25');
        return;
      }
      
      // Process the pending action with the amount user just entered
      if (pendingAction === 'fund') {
        if (amount > 10000) {
          ctx.reply('❌ Maximum funding amount is $10,000 per transaction.\nPlease enter a smaller amount:');
          return;
        }
        
        const result = walletService.fundWallet(userId, amount);
        walletService.clearPendingAction(userId);  // Clear session after processing
        
        if (result.success) {
          ctx.reply(`✅ ${result.message}`);
        } else {
          ctx.reply(`❌ ${result.message}`);
        }
      } else if (pendingAction === 'withdraw') {
        const result = walletService.withdrawFromWallet(userId, amount);
        walletService.clearPendingAction(userId);
        
        if (result.success) {
          ctx.reply(`✅ ${result.message}`);
        } else {
          ctx.reply(`❌ ${result.message}`);
        }
      }
    } else {
      // User sent random text with no pending action - show help
      ctx.reply(`
❓ I didn't understand that command. Here are the available commands:

💰 /balance - Check your current wallet balance
💵 /fund <amount> or /fund - Add money to your wallet
💸 /withdraw <amount> or /withdraw - Withdraw money from your wallet
📊 /transactions - View your last 5 transactions

Example: /fund 100 or just /fund
      `);
    }
  }
});

// Global error handler - catches any errors that slip through
bot.catch((err: any, ctx: Context) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An unexpected error occurred. Please try again.');
});

// Make sure we have a bot token before starting
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required. Please set it in your .env file.');
  process.exit(1);
}

console.log('🤖 Starting Wallet Bot...');
bot.launch();

// Enable graceful stop - these lines ensure the bot shuts down cleanly
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('✅ Wallet Bot is running!');