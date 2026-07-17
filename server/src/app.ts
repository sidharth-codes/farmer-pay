import express, { type Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authRouter } from './routes/auth.routes';
import { healthRouter } from './routes/health.routes';
import { farmRouter } from './routes/farm.routes';
import { productRouter, categoryRouter } from './routes/product.routes';
import { harvestRouter } from './routes/harvest.routes';
import { batchRouter } from './routes/batch.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/farms', farmRouter);
app.use('/products', productRouter);
app.use('/categories', categoryRouter);
app.use('/harvests', harvestRouter);
app.use('/batches', batchRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`FarmerPay API listening on :${env.PORT}`);
});

void Request;
void Response;
