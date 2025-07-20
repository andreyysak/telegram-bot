# Telegram Bot for Trip Tracking and Expense Management

This Telegram bot helps you keep track of vehicle trips, fuel expenses, income, and spending. All data is stored in a MongoDB database and can be exported to Google Sheets for further analysis.

## 📦 Technologies Used

- [grammY](https://grammy.dev/) — for building the Telegram bot
- `@grammyjs/menu` — interactive menu support
- `csv-writer` — data export to CSV
- `dotenv` — environment variable management
- `googleapis` — Google Sheets integration
- `mongoose` — MongoDB object modeling
- `pg` — PostgreSQL support (optional)
- `nodemon` — auto-reloading during development

## ⚙️ Features

### 🚗 Vehicle Menu

- Add trip records (mileage, direction)
- Log refueling data (amount, cost)
- View monthly statistics on trips and fuel usage
- Export data to Google Sheets

### 💰 Expense Tracker Menu

- Add income and expenses
- View a full financial summary by month
- Export financial data to Google Sheets

## 🗄️ Data Storage

All data is stored in a MongoDB database using Mongoose. PostgreSQL is also supported and can be used as an alternative database.

## 🚀 Getting Started

1. **Clone the repository**
   git clone https://github.com/your-username/your-repo.git
   cd your-repo

2. Install dependencies
   npm install

3. Configure environment variables
  Create a .env file and fill in the required values:

  BOT_TOKEN=your_telegram_bot_token
  MONGODB_URI=your_mongodb_connection_string
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  GOOGLE_REDIRECT_URI=your_google_redirect_uri
  GOOGLE_REFRESH_TOKEN=your_google_refresh_token
  
4. Run the bot
  npm run dev

📤 Data Export
To enable Google Sheets export, make sure your Google API credentials are correctly set in the .env file and access is granted to the appropriate spreadsheet.
