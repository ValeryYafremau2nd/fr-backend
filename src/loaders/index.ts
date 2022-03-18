import * as express from 'express';
const morgan = require('morgan');
const xss = require('xss-clean');
import * as hpp from 'hpp';
import * as compression from 'compression';
const mongoSanitize = require('express-mongo-sanitize');
import * as cookieParser from 'cookie-parser';
const rateLimit = require('express-rate-limit');
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
const helmet = require('helmet');

const client = require('prom-client');
const register = new client.Registry();

// Probe every 5th second.
const intervalCollector = client.collectDefaultMetrics({
  prefix: 'node_',
  timeout: 5000,
  register
});

const counter = new client.Counter({
  name: 'node_my_counter',
  help: 'This is my counter'
});

const gauge = new client.Gauge({
  name: 'node_my_gauge',
  help: 'This is my gauge'
});

const histogram = new client.Histogram({
  name: 'node_my_histogram',
  help: 'This is my histogram',
  buckets: [0.1, 5, 15, 50, 100, 500]
});

const summary = new client.Summary({
  name: 'node_my_summary',
  help: 'This is my summary',
  percentiles: [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999]
});

register.registerMetric(counter);
register.registerMetric(gauge);
register.registerMetric(histogram);
register.registerMetric(summary);

const httpRequestTimer = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});
register.registerMetric(httpRequestTimer);

async function mainLoader(app: any) {
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

  app.use('/metrics', async (req: any, res: any) =>
    res.end(await register.metrics())
  );
}

export default mainLoader;
