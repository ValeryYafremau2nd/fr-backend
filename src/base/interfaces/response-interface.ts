import { Response } from 'express';

export interface SentryResponse extends Response {
  sentry: any;
}
