import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { recommendations, funds } from '../../db/schema.js';
import { eq, desc, and, gte } from 'drizzle-orm';

export const recommendationsRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
        investmentHorizon: z.enum(['short', 'medium', 'long']),
        investmentGoals: z.array(z.string()),
        age: z.number().optional(),
        currentPortfolio: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { riskTolerance, investmentHorizon, investmentGoals } = input;

      // AI-driven recommendation logic (simplified for demonstration)
      // In production, this would integrate with actual AI/ML models

      // Risk mapping
      const riskMapping = {
        conservative: 'Low',
        moderate: 'Medium',
        aggressive: 'High',
      };

      // Get funds matching risk profile
      const targetRisk = riskMapping[riskTolerance];
      const matchingFunds = await ctx.db
        .select()
        .from(funds)
        .where(eq(funds.riskRating, targetRisk))
        .orderBy(desc(funds.ytdReturn))
        .limit(10);

      // Generate recommendations for each fund
      const generatedRecommendations = [];

      for (const fund of matchingFunds) {
        // Calculate recommendation score (0-100)
        let score = 50;

        // Adjust score based on returns
        const ytdReturn = parseFloat(fund.ytdReturn || '0');
        if (ytdReturn > 0.15) score += 20;
        else if (ytdReturn > 0.10) score += 15;
        else if (ytdReturn > 0.05) score += 10;

        // Adjust for expense ratio
        const expenseRatio = parseFloat(fund.expenseRatio || '0');
        if (expenseRatio < 0.005) score += 10;
        else if (expenseRatio < 0.01) score += 5;

        // Adjust for Morningstar rating
        if (fund.morningstarRating) {
          score += fund.morningstarRating * 4;
        }

        // Ensure score is between 0-100
        score = Math.min(Math.max(score, 0), 100);

        // Determine confidence level
        let confidence = 'medium';
        if (score >= 80) confidence = 'high';
        else if (score < 60) confidence = 'low';

        // Generate reasoning
        const reasoning = `This fund is recommended for ${riskTolerance} investors with a ${investmentHorizon}-term horizon.
        It has a ${fund.riskRating} risk rating and YTD return of ${(ytdReturn * 100).toFixed(2)}%.
        With an expense ratio of ${(expenseRatio * 100).toFixed(2)}% and ${
          fund.morningstarRating || 'no'
        } Morningstar rating,
        it aligns well with your investment goals: ${investmentGoals.join(', ')}.`;

        const result = await ctx.db.insert(recommendations).values({
          fundId: fund.id,
          clientProfile: {
            riskTolerance,
            investmentHorizon,
            investmentGoals,
            age: input.age,
            currentPortfolio: input.currentPortfolio,
          },
          recommendationScore: score.toFixed(2),
          reasoning: reasoning.trim(),
          confidence,
          alternativeFunds: matchingFunds
            .filter((f) => f.id !== fund.id)
            .slice(0, 3)
            .map((f) => f.id),
        });

        generatedRecommendations.push({
          id: Number(result.insertId),
          fund,
          score,
          reasoning: reasoning.trim(),
          confidence,
        });
      }

      return {
        recommendations: generatedRecommendations.sort((a, b) => b.score - a.score),
        profileMatches: matchingFunds.length,
      };
    }),

  list: publicProcedure
    .input(
      z.object({
        minScore: z.number().optional(),
        confidence: z.string().optional(),
        limit: z.number().min(1).max(50).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { minScore, confidence, limit, offset } = input;

      let query = ctx.db
        .select({
          recommendation: recommendations,
          fund: funds,
        })
        .from(recommendations)
        .leftJoin(funds, eq(recommendations.fundId, funds.id));

      const conditions = [];
      if (minScore) {
        conditions.push(gte(recommendations.recommendationScore, minScore.toString()));
      }
      if (confidence) {
        conditions.push(eq(recommendations.confidence, confidence));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query
        .orderBy(desc(recommendations.recommendationScore))
        .limit(limit)
        .offset(offset);

      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          recommendation: recommendations,
          fund: funds,
        })
        .from(recommendations)
        .leftJoin(funds, eq(recommendations.fundId, funds.id))
        .where(eq(recommendations.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  topRecommendations: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).optional().default(5) }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          recommendation: recommendations,
          fund: funds,
        })
        .from(recommendations)
        .leftJoin(funds, eq(recommendations.fundId, funds.id))
        .where(eq(recommendations.confidence, 'high'))
        .orderBy(desc(recommendations.recommendationScore))
        .limit(input.limit);

      return results;
    }),
});
