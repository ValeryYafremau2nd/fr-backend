import * as express from 'express';
import * as hpp from 'hpp';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const client = require('prom-client');
const register = new client.Registry();

const intervalCollector = client.collectDefaultMetrics({
  prefix: 'node_',
  timeout: 5000,
  register
});

const httpRequestTimer = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestTimer);

async function mainLoader(app: express.Application) {
  app.enable('trust proxy');
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
  });
  app.use('/api', limiter);
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(mongoSanitize());
  app.use(xss());
  app.use(
    hpp({
      whitelist: []
    })
  );
  app.use(compression());
  app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(cookieParser());

  app.options('*', cors());

  app.use('/metrics', async (req: express.Request, res: express.Response) =>
    res.end(await register.metrics())
  );
}

export default mainLoader;
