import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { funds } from '../../db/schema.js';
import { eq, like, desc, asc, sql } from 'drizzle-orm';

export const fundsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        sortBy: z.enum(['name', 'aum', 'ytdReturn', 'expenseRatio']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, category, sortBy, sortOrder, limit, offset } = input;

      let query = ctx.db.select().from(funds);

      const conditions = [];
      if (search) {
        conditions.push(like(funds.name, `%${search}%`));
      }
      if (category) {
        conditions.push(eq(funds.category, category));
      }

      if (conditions.length > 0) {
        query = query.where(sql`${sql.join(conditions, sql` AND `)}`);
      }

      if (sortBy) {
        const column = funds[sortBy];
        query = query.orderBy(sortOrder === 'desc' ? desc(column) : asc(column));
      }

      const results = await query.limit(limit).offset(offset);
      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(funds)
        .where(eq(funds.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(20),
        name: z.string().min(1).max(255),
        category: z.string().min(1).max(100),
        aum: z.string(),
        expenseRatio: z.string(),
        ytdReturn: z.string().optional(),
        oneYearReturn: z.string().optional(),
        threeYearReturn: z.string().optional(),
        fiveYearReturn: z.string().optional(),
        riskRating: z.string().optional(),
        morningstarRating: z.number().min(1).max(5).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(funds).values(input);
      return { id: Number(result.insertId), ...input };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        ticker: z.string().min(1).max(20).optional(),
        name: z.string().min(1).max(255).optional(),
        category: z.string().min(1).max(100).optional(),
        aum: z.string().optional(),
        expenseRatio: z.string().optional(),
        ytdReturn: z.string().optional(),
        oneYearReturn: z.string().optional(),
        threeYearReturn: z.string().optional(),
        fiveYearReturn: z.string().optional(),
        riskRating: z.string().optional(),
        morningstarRating: z.number().min(1).max(5).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      await ctx.db.update(funds).set(updateData).where(eq(funds.id, id));
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(funds).where(eq(funds.id, input.id));
      return { success: true };
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .selectDistinct({ category: funds.category })
      .from(funds);
    return results.map((r) => r.category);
  }),

  topPerformers: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).optional().default(5) }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(funds)
        .orderBy(desc(funds.ytdReturn))
        .limit(input.limit);
      return results;
    }),
});
