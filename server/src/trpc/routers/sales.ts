import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { sales, funds } from '../../db/schema.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export const salesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        fundId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fundId, startDate, endDate, status, limit, offset } = input;

      let query = ctx.db
        .select({
          sale: sales,
          fund: funds,
        })
        .from(sales)
        .leftJoin(funds, eq(sales.fundId, funds.id));

      const conditions = [];
      if (fundId) {
        conditions.push(eq(sales.fundId, fundId));
      }
      if (startDate) {
        conditions.push(gte(sales.saleDate, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(sales.saleDate, new Date(endDate)));
      }
      if (status) {
        conditions.push(eq(sales.status, status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query
        .orderBy(desc(sales.saleDate))
        .limit(limit)
        .offset(offset);

      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          sale: sales,
          fund: funds,
        })
        .from(sales)
        .leftJoin(funds, eq(sales.fundId, funds.id))
        .where(eq(sales.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        fundId: z.number(),
        clientName: z.string().min(1).max(255),
        clientEmail: z.string().email().max(255),
        amount: z.string(),
        units: z.string(),
        pricePerUnit: z.string(),
        saleDate: z.string(),
        status: z.string().optional().default('completed'),
        salesRepId: z.string().optional(),
        salesRepName: z.string().optional(),
        commission: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(sales).values({
        ...input,
        saleDate: new Date(input.saleDate),
      });
      return { id: Number(result.insertId), ...input };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        fundId: z.number().optional(),
        clientName: z.string().min(1).max(255).optional(),
        clientEmail: z.string().email().max(255).optional(),
        amount: z.string().optional(),
        units: z.string().optional(),
        pricePerUnit: z.string().optional(),
        saleDate: z.string().optional(),
        status: z.string().optional(),
        salesRepId: z.string().optional(),
        salesRepName: z.string().optional(),
        commission: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, saleDate, ...updateData } = input;
      const dataToUpdate = {
        ...updateData,
        ...(saleDate && { saleDate: new Date(saleDate) }),
      };
      await ctx.db.update(sales).set(dataToUpdate).where(eq(sales.id, id));
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(sales).where(eq(sales.id, input.id));
      return { success: true };
    }),

  statistics: publicProcedure
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

      const stats = await ctx.db
        .select({
          totalSales: sql<string>`COALESCE(SUM(${sales.amount}), 0)`,
          totalTransactions: sql<number>`COUNT(*)`,
          averageAmount: sql<string>`COALESCE(AVG(${sales.amount}), 0)`,
          totalCommission: sql<string>`COALESCE(SUM(${sales.commission}), 0)`,
        })
        .from(sales)
        .where(whereClause);

      return stats[0];
    }),

  recentActivity: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional().default(10) }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          sale: sales,
          fund: funds,
        })
        .from(sales)
        .leftJoin(funds, eq(sales.fundId, funds.id))
        .orderBy(desc(sales.createdAt))
        .limit(input.limit);

      return results;
    }),
});
