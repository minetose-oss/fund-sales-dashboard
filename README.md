# Fund Sales Dashboard

A comprehensive full-stack fund sales dashboard with real-time analytics, AI-powered recommendations, and market insights.

## Tech Stack

### Frontend
- **React 19** - Latest version with improved performance
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **tRPC** - End-to-end typesafe APIs
- **Socket.IO Client** - Real-time updates
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching and caching

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **tRPC** - Type-safe API layer
- **Socket.IO** - Real-time bidirectional communication
- **Drizzle ORM** - TypeScript ORM
- **MySQL** - Relational database
- **Zod** - Schema validation

## Features

### 1. Dashboard
- Overview of key metrics (AUM, Revenue, Transactions)
- Top performing funds
- Recent sales activity
- Latest market insights
- Real-time updates

### 2. Fund Database
- Comprehensive fund listings
- Search and filter by category
- Performance metrics (YTD, 1Y, 3Y, 5Y returns)
- Risk ratings and Morningstar ratings
- Expense ratios and AUM data

### 3. Sales Tracking
- Complete transaction history
- Sales statistics and analytics
- Client information management
- Commission tracking
- Sales representative performance

### 4. Advanced Analytics
- Overview dashboard with key metrics
- Fund performance comparisons
- Category breakdown analysis
- Interactive charts and visualizations
- Sales trends over time

### 5. AI Recommendations
- Personalized fund recommendations
- Risk tolerance profiling
- Investment horizon matching
- Goal-based suggestions
- Confidence scoring system

### 6. Market Insights
- Latest market news and analysis
- Sentiment analysis (Positive, Negative, Neutral)
- Category filtering
- Related fund tracking
- Real-time updates

## Project Structure

```
fund-sales-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   └── Layout.tsx
│   │   ├── pages/        # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Funds.tsx
│   │   │   ├── Sales.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   └── Insights.tsx
│   │   ├── lib/          # Utility functions
│   │   │   ├── trpc.ts
│   │   │   ├── socket.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── db/           # Database configuration
│   │   │   ├── schema.ts # Drizzle schema definitions
│   │   │   └── index.ts
│   │   ├── trpc/         # tRPC configuration
│   │   │   ├── context.ts
│   │   │   ├── trpc.ts
│   │   │   ├── router.ts
│   │   │   └── routers/
│   │   │       ├── funds.ts
│   │   │       ├── sales.ts
│   │   │       ├── analytics.ts
│   │   │       ├── recommendations.ts
│   │   │       └── insights.ts
│   │   ├── services/     # Business logic
│   │   │   └── seedData.ts
│   │   └── index.ts      # Server entry point
│   ├── drizzle.config.ts
│   └── package.json
│
├── package.json           # Root workspace config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fund-sales-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Configure MySQL Database**

   Create a MySQL database:
   ```sql
   CREATE DATABASE fund_sales_dashboard;
   ```

4. **Set up environment variables**

   Server (`.env` in `server/` directory):
   ```env
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=fund_sales_dashboard
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

   Client (`.env` in `client/` directory):
   ```env
   VITE_API_URL=http://localhost:3000/trpc
   VITE_SOCKET_URL=http://localhost:3000
   ```

5. **Generate and push database schema**
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   ```

6. **Seed the database with sample data**
   ```bash
   cd server
   npx tsx src/services/seedData.ts
   ```

### Running the Application

#### Development Mode

Run both client and server concurrently:
```bash
npm run dev
```

Or run them separately:

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- tRPC endpoint: http://localhost:3000/trpc

#### Production Mode

**Build:**
```bash
npm run build
```

**Start:**
```bash
cd server
npm start
```

## Database Schema

### Tables

- **funds** - Investment fund information
- **sales** - Sales transactions
- **market_insights** - Market news and analysis
- **recommendations** - AI-generated recommendations
- **analytics_snapshots** - Historical analytics data

## API Endpoints (tRPC)

### Funds
- `funds.list` - List all funds with filters
- `funds.getById` - Get fund by ID
- `funds.create` - Create new fund
- `funds.update` - Update fund
- `funds.delete` - Delete fund
- `funds.categories` - Get all categories
- `funds.topPerformers` - Get top performing funds

### Sales
- `sales.list` - List all sales
- `sales.getById` - Get sale by ID
- `sales.create` - Create new sale
- `sales.update` - Update sale
- `sales.delete` - Delete sale
- `sales.statistics` - Get sales statistics
- `sales.recentActivity` - Get recent sales

### Analytics
- `analytics.overview` - Get overview metrics
- `analytics.salesTrends` - Get sales trends
- `analytics.fundPerformance` - Get fund performance data
- `analytics.categoryBreakdown` - Get category analysis
- `analytics.salesByRep` - Get sales by representative
- `analytics.createSnapshot` - Create analytics snapshot

### Recommendations
- `recommendations.generate` - Generate AI recommendations
- `recommendations.list` - List recommendations
- `recommendations.getById` - Get recommendation by ID
- `recommendations.topRecommendations` - Get top recommendations

### Insights
- `insights.list` - List market insights
- `insights.getById` - Get insight by ID
- `insights.create` - Create new insight
- `insights.latest` - Get latest insights
- `insights.categories` - Get all categories
- `insights.sentimentAnalysis` - Get sentiment analysis

## Real-time Features

The application uses Socket.IO for real-time updates:

- **Sales Updates** - Real-time notification of new sales
- **Analytics Updates** - Live metrics updates
- **Market Insights** - Instant delivery of new insights

## Development Tools

### Drizzle Studio

Explore your database with Drizzle Studio:
```bash
cd server
npm run db:studio
```

### Type Safety

The project uses TypeScript throughout with full type safety between client and server thanks to tRPC.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Built with modern web technologies
- UI components from shadcn/ui
- Icons from Lucide React
- Charts from Recharts
