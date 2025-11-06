import { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { db } from '../db/index.js';

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  return {
    db,
    req,
    res,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
