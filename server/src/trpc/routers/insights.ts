import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { marketInsights } from '../../db/schema.js';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export const insightsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        sentiment: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { category, sentiment, startDate, endDate, limit, offset } = input;

      let query = ctx.db.select().from(marketInsights);

      const conditions = [];
      if (category) {
        conditions.push(eq(marketInsights.category, category));
      }
      if (sentiment) {
        conditions.push(eq(marketInsights.sentiment, sentiment));
      }
      if (startDate) {
        conditions.push(gte(marketInsights.publishedAt, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(marketInsights.publishedAt, new Date(endDate)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query
        .orderBy(desc(marketInsights.publishedAt))
        .limit(limit)
        .offset(offset);

      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(marketInsights)
        .where(eq(marketInsights.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        category: z.string().min(1).max(100),
        sentiment: z.string().optional(),
        relevantTickers: z.array(z.string()).optional(),
        source: z.string().optional(),
        publishedAt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(marketInsights).values({
        ...input,
        publishedAt: new Date(input.publishedAt),
      });
      return { id: Number(result.insertId), ...input };
    }),

  latest: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).optional().default(5) }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(marketInsights)
        .orderBy(desc(marketInsights.publishedAt))
        .limit(input.limit);

      return results;
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .selectDistinct({ category: marketInsights.category })
      .from(marketInsights);
    return results.map((r) => r.category);
  }),

  sentimentAnalysis: publicProcedure
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
        conditions.push(gte(marketInsights.publishedAt, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(marketInsights.publishedAt, new Date(endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await ctx.db
        .select()
        .from(marketInsights)
        .where(whereClause);

      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0,
      };

      results.forEach((insight) => {
        if (insight.sentiment) {
          sentimentCounts[insight.sentiment as keyof typeof sentimentCounts]++;
        }
      });

      return {
        total: results.length,
        sentimentBreakdown: sentimentCounts,
        sentimentPercentages: {
          positive: (sentimentCounts.positive / results.length) * 100,
          negative: (sentimentCounts.negative / results.length) * 100,
          neutral: (sentimentCounts.neutral / results.length) * 100,
        },
      };
    }),
});
