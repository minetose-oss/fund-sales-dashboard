import { mysqlTable, varchar, decimal, int, timestamp, text, json, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Funds table
export const funds = mysqlTable('funds', {
  id: int('id').primaryKey().autoincrement(),
  ticker: varchar('ticker', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  aum: decimal('aum', { precision: 20, scale: 2 }).notNull(), // Assets Under Management
  expenseRatio: decimal('expense_ratio', { precision: 5, scale: 4 }).notNull(),
  ytdReturn: decimal('ytd_return', { precision: 10, scale: 4 }),
  oneYearReturn: decimal('one_year_return', { precision: 10, scale: 4 }),
  threeYearReturn: decimal('three_year_return', { precision: 10, scale: 4 }),
  fiveYearReturn: decimal('five_year_return', { precision: 10, scale: 4 }),
  riskRating: varchar('risk_rating', { length: 20 }), // Low, Medium, High
  morningstarRating: int('morningstar_rating'), // 1-5 stars
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  tickerIdx: index('ticker_idx').on(table.ticker),
}));

// Sales table
export const sales = mysqlTable('sales', {
  id: int('id').primaryKey().autoincrement(),
  fundId: int('fund_id').notNull().references(() => funds.id),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientEmail: varchar('client_email', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  units: decimal('units', { precision: 15, scale: 4 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 4 }).notNull(),
  saleDate: timestamp('sale_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('completed'), // completed, pending, cancelled
  salesRepId: varchar('sales_rep_id', { length: 100 }),
  salesRepName: varchar('sales_rep_name', { length: 255 }),
  commission: decimal('commission', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  fundIdx: index('fund_idx').on(table.fundId),
  dateIdx: index('date_idx').on(table.saleDate),
  clientEmailIdx: index('client_email_idx').on(table.clientEmail),
}));

// Market insights table
export const marketInsights = mysqlTable('market_insights', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // market_news, trend_analysis, economic_indicator
  sentiment: varchar('sentiment', { length: 50 }), // positive, negative, neutral
  relevantTickers: json('relevant_tickers').$type<string[]>(),
  source: varchar('source', { length: 255 }),
  publishedAt: timestamp('published_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  publishedIdx: index('published_idx').on(table.publishedAt),
}));

// AI Recommendations table
export const recommendations = mysqlTable('recommendations', {
  id: int('id').primaryKey().autoincrement(),
  fundId: int('fund_id').notNull().references(() => funds.id),
  clientProfile: json('client_profile').$type<{
    riskTolerance: string;
    investmentHorizon: string;
    investmentGoals: string[];
    age?: number;
    currentPortfolio?: string[];
  }>().notNull(),
  recommendationScore: decimal('recommendation_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  reasoning: text('reasoning').notNull(),
  confidence: varchar('confidence', { length: 50 }).notNull(), // high, medium, low
  alternativeFunds: json('alternative_funds').$type<number[]>(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  fundIdx: index('fund_idx').on(table.fundId),
  scoreIdx: index('score_idx').on(table.recommendationScore),
}));

// Analytics snapshots table (for historical data)
export const analyticsSnapshots = mysqlTable('analytics_snapshots', {
  id: int('id').primaryKey().autoincrement(),
  snapshotDate: timestamp('snapshot_date').notNull(),
  totalAUM: decimal('total_aum', { precision: 20, scale: 2 }).notNull(),
  totalSales: decimal('total_sales', { precision: 20, scale: 2 }).notNull(),
  totalTransactions: int('total_transactions').notNull(),
  topPerformingFund: int('top_performing_fund').references(() => funds.id),
  averageReturn: decimal('average_return', { precision: 10, scale: 4 }),
  metrics: json('metrics').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  dateIdx: index('date_idx').on(table.snapshotDate),
}));

// Relations
export const fundsRelations = relations(funds, ({ many }) => ({
  sales: many(sales),
  recommendations: many(recommendations),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  fund: one(funds, {
    fields: [sales.fundId],
    references: [funds.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  fund: one(funds, {
    fields: [recommendations.fundId],
    references: [funds.id],
  }),
}));

// Export types
export type Fund = typeof funds.$inferSelect;
export type NewFund = typeof funds.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type MarketInsight = typeof marketInsights.$inferSelect;
export type NewMarketInsight = typeof marketInsights.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;
export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type NewAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert;
