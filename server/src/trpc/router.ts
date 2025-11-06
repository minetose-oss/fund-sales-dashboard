import { router } from './trpc.js';
import { fundsRouter } from './routers/funds.js';
import { salesRouter } from './routers/sales.js';
import { analyticsRouter } from './routers/analytics.js';
import { recommendationsRouter } from './routers/recommendations.js';
import { insightsRouter } from './routers/insights.js';

export const appRouter = router({
  funds: fundsRouter,
  sales: salesRouter,
  analytics: analyticsRouter,
  recommendations: recommendationsRouter,
  insights: insightsRouter,
});

export type AppRouter = typeof appRouter;
