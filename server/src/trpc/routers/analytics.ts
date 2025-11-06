import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { sales, funds, analyticsSnapshots } from '../../db/schema.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export const analyticsRouter = router({
  overview: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      const conditions = [];
      if (startDate) {
        conditions.push(gte(sales.saleDate, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(sales.saleDate, new Date(endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Total statistics
      const totalStats = await ctx.db
        .select({
          totalRevenue: sql<string>`COALESCE(SUM(${sales.amount}), 0)`,
          totalTransactions: sql<number>`COUNT(*)`,
          averageTransactionSize: sql<string>`COALESCE(AVG(${sales.amount}), 0)`,
          totalCommission: sql<string>`COALESCE(SUM(${sales.commission}), 0)`,
        })
        .from(sales)
        .where(whereClause);

      // Sales by fund
      const salesByFund = await ctx.db
        .select({
          fundId: sales.fundId,
          fundName: funds.name,
          fundTicker: funds.ticker,
          totalSales: sql<string>`COALESCE(SUM(${sales.amount}), 0)`,
          transactionCount: sql<number>`COUNT(*)`,
        })
        .from(sales)
        .leftJoin(funds, eq(sales.fundId, funds.id))
        .where(whereClause)
        .groupBy(sales.fundId, funds.name, funds.ticker)
        .orderBy(desc(sql`SUM(${sales.amount})`))
        .limit(10);

      // Total AUM
      const aumStats = await ctx.db
        .select({
          totalAUM: sql<string>`COALESCE(SUM(${funds.aum}), 0)`,
          fundCount: sql<number>`COUNT(*)`,
        })
        .from(funds);

      return {
        ...totalStats[0],
        ...aumStats[0],
        topFunds: salesByFund,
      };
    }),

  salesTrends: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, groupBy } = input;

      const dateFormat =
        groupBy === 'month'
          ? '%Y-%m'
          : groupBy === 'week'
          ? '%Y-%U'
          : '%Y-%m-%d';

      const results = await ctx.db
        .select({
          period: sql<string>`DATE_FORMAT(${sales.saleDate}, ${dateFormat})`,
          totalSales: sql<string>`COALESCE(SUM(${sales.amount}), 0)`,
          transactionCount: sql<number>`COUNT(*)`,
          averageAmount: sql<string>`COALESCE(AVG(${sales.amount}), 0)`,
        })
        .from(sales)
        .where(
          and(
            gte(sales.saleDate, new Date(startDate)),
            lte(sales.saleDate, new Date(endDate))
          )
        )
        .groupBy(sql`DATE_FORMAT(${sales.saleDate}, ${dateFormat})`)
        .orderBy(sql`DATE_FORMAT(${sales.saleDate}, ${dateFormat})`);

      return results;
    }),

  fundPerformance: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional().default(10) }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(funds)
        .orderBy(desc(funds.ytdReturn))
        .limit(input.limit);

      return results;
    }),

  categoryBreakdown: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .select({
        category: funds.category,
        fundCount: sql<number>`COUNT(*)`,
        totalAUM: sql<string>`COALESCE(SUM(${funds.aum}), 0)`,
        averageReturn: sql<string>`COALESCE(AVG(${funds.ytdReturn}), 0)`,
      })
      .from(funds)
      .groupBy(funds.category);

    return results;
  }),

  salesByRep: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(50).optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, limit } = input;

      const conditions = [];
      if (startDate) {
        conditions.push(gte(sales.saleDate, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(sales.saleDate, new Date(endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await ctx.db
        .select({
          salesRepId: sales.salesRepId,
          salesRepName: sales.salesRepName,
          totalSales: sql<string>`COALESCE(SUM(${sales.amount}), 0)`,
          transactionCount: sql<number>`COUNT(*)`,
          totalCommission: sql<string>`COALESCE(SUM(${sales.commission}), 0)`,
        })
        .from(sales)
        .where(whereClause)
        .groupBy(sales.salesRepId, sales.salesRepName)
        .orderBy(desc(sql`SUM(${sales.amount})`))
        .limit(limit);

      return results;
    }),

  createSnapshot: publicProcedure
    .input(
      z.object({
        snapshotDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate current metrics
      const totalStats = await ctx.db
        .select({
          totalAUM: sql<string>`COALESCE(SUM(${funds.aum}), 0)`,
        })
        .from(funds);

      const salesStats = await ctx.db
        .select({
          totalSales: sql<string>`COALESCE(SUM(${sales.amount}), 0)`,
          totalTransactions: sql<number>`COUNT(*)`,
        })
        .from(sales);

      const topFund = await ctx.db
        .select()
        .from(funds)
        .orderBy(desc(funds.ytdReturn))
        .limit(1);

      const avgReturn = await ctx.db
        .select({
          averageReturn: sql<string>`COALESCE(AVG(${funds.ytdReturn}), 0)`,
        })
        .from(funds);

      const result = await ctx.db.insert(analyticsSnapshots).values({
        snapshotDate: new Date(input.snapshotDate),
        totalAUM: totalStats[0].totalAUM,
        totalSales: salesStats[0].totalSales,
        totalTransactions: salesStats[0].totalTransactions,
        topPerformingFund: topFund[0]?.id,
        averageReturn: avgReturn[0].averageReturn,
        metrics: {},
      });

      return { id: Number(result.insertId), success: true };
    }),
});
