import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Funds table
export const funds = sqliteTable('funds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticker: text('ticker').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  aum: real('aum').notNull(), // Assets Under Management
  expenseRatio: real('expense_ratio').notNull(),
  ytdReturn: real('ytd_return'),
  oneYearReturn: real('one_year_return'),
  threeYearReturn: real('three_year_return'),
  fiveYearReturn: real('five_year_return'),
  riskRating: text('risk_rating'), // Low, Medium, High
  morningstarRating: integer('morningstar_rating'), // 1-5 stars
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  tickerIdx: index('ticker_idx').on(table.ticker),
}));

// Sales table
export const sales = sqliteTable('sales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fundId: integer('fund_id').notNull().references(() => funds.id),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  amount: real('amount').notNull(),
  units: real('units').notNull(),
  pricePerUnit: real('price_per_unit').notNull(),
  saleDate: integer('sale_date', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('completed'), // completed, pending, cancelled
  salesRepId: text('sales_rep_id'),
  salesRepName: text('sales_rep_name'),
  commission: real('commission'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  fundIdx: index('fund_idx').on(table.fundId),
  dateIdx: index('date_idx').on(table.saleDate),
  clientEmailIdx: index('client_email_idx').on(table.clientEmail),
}));

// Market insights table
export const marketInsights = sqliteTable('market_insights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(), // market_news, trend_analysis, economic_indicator
  sentiment: text('sentiment'), // positive, negative, neutral
  relevantTickers: text('relevant_tickers', { mode: 'json' }).$type<string[]>(),
  source: text('source'),
  publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  publishedIdx: index('published_idx').on(table.publishedAt),
}));

// AI Recommendations table
export const recommendations = sqliteTable('recommendations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fundId: integer('fund_id').notNull().references(() => funds.id),
  clientProfile: text('client_profile', { mode: 'json' }).$type<{
    riskTolerance: string;
    investmentHorizon: string;
    investmentGoals: string[];
    age?: number;
    currentPortfolio?: string[];
  }>().notNull(),
  recommendationScore: real('recommendation_score').notNull(), // 0-100
  reasoning: text('reasoning').notNull(),
  confidence: text('confidence').notNull(), // high, medium, low
  alternativeFunds: text('alternative_funds', { mode: 'json' }).$type<number[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  fundIdx: index('fund_idx').on(table.fundId),
  scoreIdx: index('score_idx').on(table.recommendationScore),
}));

// Analytics snapshots table (for historical data)
export const analyticsSnapshots = sqliteTable('analytics_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  snapshotDate: integer('snapshot_date', { mode: 'timestamp' }).notNull(),
  totalAUM: real('total_aum').notNull(),
  totalSales: real('total_sales').notNull(),
  totalTransactions: integer('total_transactions').notNull(),
  topPerformingFund: integer('top_performing_fund').references(() => funds.id),
  averageReturn: real('average_return'),
  metrics: text('metrics', { mode: 'json' }).$type<Record<string, any>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
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
