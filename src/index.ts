import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import * as dotenv from 'dotenv';
import walletService from './walletService';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx: Context) => {
  const welcomeMessage = `
🎉 Welcome to Wallet Bot! 🎉

I'm here to help you manage your virtual wallet. Here's what I can do:

💰 /balance - Check your current wallet balance
💵 /fund <amount> - Add money to your wallet
💸 /withdraw <amount> - Withdraw money from your wallet
📊 /transactions - View your last 5 transactions

This is a simulation bot - no real money is involved! 
Just type any command to get started.

Example: /fund 100
  `;
  
  ctx.reply(welcomeMessage);
});

bot.command('balance', (ctx: Context) => {
  try {
    const userId = ctx.from?.id;
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

bot.command('fund', (ctx: Context) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) {
      ctx.reply('❌ Unable to identify user.');
      return;
    }

    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const args = messageText.split(' ');
    
    if (args.length < 2) {
      ctx.reply('❌ Please specify an amount to fund.\nExample: /fund 50');
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
      ctx.reply('❌ Please specify an amount to withdraw.\nExample: /withdraw 25');
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

bot.on('text', (ctx: Context) => {
  const message = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
  
  if (!message.startsWith('/')) {
    ctx.reply(`
❓ I didn't understand that command. Here are the available commands:

💰 /balance - Check your current wallet balance
💵 /fund <amount> - Add money to your wallet
💸 /withdraw <amount> - Withdraw money from your wallet
📊 /transactions - View your last 5 transactions

Example: /fund 100
    `);
  }
});

bot.catch((err: any, ctx: Context) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An unexpected error occurred. Please try again.');
});

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required. Please set it in your .env file.');
  process.exit(1);
}

console.log('🤖 Starting Wallet Bot...');
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('✅ Wallet Bot is running!');