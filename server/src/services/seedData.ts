import { db } from '../db/index.js';
import { funds, sales, marketInsights } from '../db/schema.js';

export async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Seed sample funds
    const sampleFunds = [
      {
        ticker: 'VFIAX',
        name: 'Vanguard 500 Index Fund',
        category: 'Large Cap Growth',
        aum: '350000000000',
        expenseRatio: '0.0004',
        ytdReturn: '0.2450',
        oneYearReturn: '0.2650',
        threeYearReturn: '0.1850',
        fiveYearReturn: '0.1950',
        riskRating: 'Medium',
        morningstarRating: 5,
        description: 'Seeks to track the performance of the S&P 500 Index',
      },
      {
        ticker: 'VTSAX',
        name: 'Vanguard Total Stock Market Index',
        category: 'Large Cap Blend',
        aum: '280000000000',
        expenseRatio: '0.0004',
        ytdReturn: '0.2350',
        oneYearReturn: '0.2550',
        threeYearReturn: '0.1750',
        fiveYearReturn: '0.1850',
        riskRating: 'Medium',
        morningstarRating: 5,
        description: 'Seeks to track the performance of the entire US stock market',
      },
      {
        ticker: 'VBMFX',
        name: 'Vanguard Total Bond Market Index',
        category: 'Bond',
        aum: '260000000000',
        expenseRatio: '0.0005',
        ytdReturn: '0.0450',
        oneYearReturn: '0.0550',
        threeYearReturn: '0.0350',
        fiveYearReturn: '0.0450',
        riskRating: 'Low',
        morningstarRating: 4,
        description: 'Seeks to track the performance of the US investment-grade bond market',
      },
      {
        ticker: 'VGTSX',
        name: 'Vanguard Total International Stock',
        category: 'International',
        aum: '180000000000',
        expenseRatio: '0.0007',
        ytdReturn: '0.1850',
        oneYearReturn: '0.1950',
        threeYearReturn: '0.1250',
        fiveYearReturn: '0.1350',
        riskRating: 'High',
        morningstarRating: 4,
        description: 'Seeks to track the performance of international stocks',
      },
      {
        ticker: 'VWINX',
        name: 'Vanguard Wellesley Income',
        category: 'Balanced',
        aum: '75000000000',
        expenseRatio: '0.0023',
        ytdReturn: '0.1250',
        oneYearReturn: '0.1350',
        threeYearReturn: '0.0950',
        fiveYearReturn: '0.1050',
        riskRating: 'Low',
        morningstarRating: 5,
        description: 'Balanced fund with 60% bonds and 40% stocks',
      },
    ];

    const insertedFunds = await db.insert(funds).values(sampleFunds);
    console.log(`Inserted ${sampleFunds.length} funds`);

    // Seed sample sales
    const sampleSales = [
      {
        fundId: 1,
        clientName: 'John Smith',
        clientEmail: 'john.smith@example.com',
        amount: '50000.00',
        units: '150.25',
        pricePerUnit: '332.78',
        saleDate: new Date('2024-01-15'),
        status: 'completed',
        salesRepId: 'REP001',
        salesRepName: 'Alice Johnson',
        commission: '500.00',
        notes: 'First-time investor, conservative profile',
      },
      {
        fundId: 2,
        clientName: 'Sarah Williams',
        clientEmail: 'sarah.williams@example.com',
        amount: '75000.00',
        units: '200.50',
        pricePerUnit: '374.07',
        saleDate: new Date('2024-01-20'),
        status: 'completed',
        salesRepId: 'REP002',
        salesRepName: 'Bob Martinez',
        commission: '750.00',
        notes: 'Diversifying portfolio',
      },
      {
        fundId: 3,
        clientName: 'Michael Brown',
        clientEmail: 'michael.brown@example.com',
        amount: '100000.00',
        units: '850.75',
        pricePerUnit: '117.54',
        saleDate: new Date('2024-02-01'),
        status: 'completed',
        salesRepId: 'REP001',
        salesRepName: 'Alice Johnson',
        commission: '1000.00',
        notes: 'Bond allocation for retirement',
      },
    ];

    await db.insert(sales).values(sampleSales);
    console.log(`Inserted ${sampleSales.length} sales records`);

    // Seed sample market insights
    const sampleInsights = [
      {
        title: 'Federal Reserve Holds Interest Rates Steady',
        content:
          'The Federal Reserve announced today that it will maintain current interest rates, signaling confidence in the current economic trajectory.',
        category: 'market_news',
        sentiment: 'neutral',
        relevantTickers: ['VFIAX', 'VBMFX'],
        source: 'Federal Reserve',
        publishedAt: new Date('2024-03-01'),
      },
      {
        title: 'Tech Sector Shows Strong Q1 Performance',
        content:
          'Technology stocks continue to outperform broader market indices with strong earnings reports from major companies.',
        category: 'trend_analysis',
        sentiment: 'positive',
        relevantTickers: ['VFIAX', 'VTSAX'],
        source: 'Market Analysis',
        publishedAt: new Date('2024-03-05'),
      },
      {
        title: 'International Markets Face Headwinds',
        content:
          'Emerging markets show volatility amid geopolitical tensions and currency fluctuations.',
        category: 'market_news',
        sentiment: 'negative',
        relevantTickers: ['VGTSX'],
        source: 'Global Markets Report',
        publishedAt: new Date('2024-03-10'),
      },
    ];

    await db.insert(marketInsights).values(sampleInsights);
    console.log(`Inserted ${sampleInsights.length} market insights`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding script failed:', error);
      process.exit(1);
    });
}
