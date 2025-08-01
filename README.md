# 🤖 Telegram Wallet Bot

A simple Telegram bot that simulates a basic wallet management experience built with Node.js and TypeScript.

## ✨ Features

- **Balance Management**: Check your current wallet balance
- **Fund Wallet**: Add money to your wallet (simulated) - Direct or Interactive mode
- **Withdraw Funds**: Remove money from your wallet with insufficient funds protection - Direct or Interactive mode
- **Interactive UI**: User-friendly prompts when amount is not specified in commands
- **Session Management**: Tracks pending user interactions with 5-minute timeout
- **Transaction History**: View your last 5 transactions with timestamps
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Tech Stack

- **Node.js** with **TypeScript**
- **Telegraf** - Modern Telegram Bot API framework
- **dotenv** - Environment configuration
- **In-memory storage** - No external database required

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <https://github.com/skynette/telegram-bank-bot-simulation>
cd telegram-bank-bot-simulation
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your bot token:

```env
BOT_TOKEN=your_telegram_bot_token_here
```

### 3. Getting Your Bot Token

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token and paste it in your `.env` file

### 4. Run the Bot

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## 🎯 Bot Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Welcome message and bot introduction | `/start` |
| `/balance` | Check your current wallet balance | `/balance` |
| `/fund <amount>` or `/fund` | Add money to your wallet (direct or interactive) | `/fund 100` or `/fund` |
| `/withdraw <amount>` or `/withdraw` | Withdraw money from your wallet (direct or interactive) | `/withdraw 50` or `/withdraw` |
| `/transactions` | View your last 5 transactions | `/transactions` |

## 💡 Usage Examples

### Starting the Bot
```
User: /start
Bot: 🎉 Welcome to Wallet Bot! 🎉
     I'm here to help you manage your virtual wallet...
```

### Checking Balance
```
User: /balance
Bot: 💰 Your wallet balance is $0.00
```

### Funding Wallet

**Direct Method:**
```
User: /fund 150
Bot: ✅ Wallet funded with $150.00. New balance: $150.00
```

**Interactive Method:**
```
User: /fund
Bot: 💵 How much would you like to fund your wallet?

     Please enter the amount (e.g., 50, 100.50):
User: 150
Bot: ✅ Wallet funded with $150.00. New balance: $150.00
```

### Withdrawing Funds

**Direct Method:**
```
User: /withdraw 50
Bot: ✅ Successfully withdrew $50.00. New balance: $100.00

User: /withdraw 200
Bot: ❌ Insufficient funds
```

**Interactive Method:**
```
User: /withdraw
Bot: 💸 How much would you like to withdraw?

     Your current balance: $150.00
     Please enter the amount (e.g., 25, 50.75):
User: 50
Bot: ✅ Successfully withdrew $50.00. New balance: $100.00
```

### Viewing Transactions
```
User: /transactions
Bot: 📊 Your last 5 transactions:
     
     💵 +$150.00
        Wallet funded with $150.00
        1/31/2025 at 2:30:45 PM
     
     💸 -$50.00
        Withdrew $50.00 from wallet
        1/31/2025 at 2:31:12 PM
```

## 🔧 Project Structure

```
assesment/
├── src/
│   ├── index.ts          # Main bot file with command handlers
│   ├── walletService.ts  # Wallet management service
│   └── types.ts          # TypeScript interfaces
├── dist/                 # Compiled JavaScript (generated)
├── .env                  # Environment variables (create this)
├── .env.example          # Environment template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🛡️ Input Validation & Security

- **Amount Validation**: Only positive numbers are accepted (both direct and interactive modes)
- **Maximum Limits**: Funding is limited to $10,000 per transaction
- **Insufficient Funds**: Withdrawals are blocked if balance is insufficient
- **Session Timeout**: Interactive sessions expire after 5 minutes for security
- **Error Handling**: All errors are caught and user-friendly messages are displayed
- **User Identification**: Each user's wallet is isolated by Telegram user ID

## 🗄️ Data Storage

The bot uses **in-memory storage** for simplicity:
- User wallets are stored in a JavaScript object
- User sessions are tracked for interactive mode
- Data persists only while the bot is running
- Each restart clears all data (perfect for testing/demo)

## 📝 Development Notes

### Available Scripts

- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled bot
- `npm test` - Run tests (placeholder)

### Code Quality Features

- **TypeScript** for type safety
- **Comprehensive error handling**
- **Input validation**
- **Clean code structure with separation of concerns**
- **Detailed logging for debugging**

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if your bot token is correct in `.env`
   - Ensure the bot is not already running elsewhere
   - Verify your internet connection

2. **"BOT_TOKEN is required" error**
   - Make sure you have a `.env` file
   - Check that `BOT_TOKEN` is set in your `.env` file
   - Restart the bot after updating the token

3. **Commands not working**
   - Make sure you're using the correct command format
   - Try `/start` first to initialize your wallet
   - Check the bot's response for error messages

### Development Tips

- Use `npm run dev` for development with auto-reload
- Check the console for detailed error logs
- Test all commands thoroughly before deployment

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for error details
3. Ensure all prerequisites are met
4. Verify your bot token is valid

---

**Note**: This is a simulation bot for demonstration purposes. No real money or payment processing is involved.