import * as dotenv from 'dotenv';
import { injectable } from 'inversify';

@injectable()
class ConfigService {
  public readonly JWT_SECRET: string;
  public readonly JWT_EXPIRES_IN: string;
  public readonly JWT_COOKIE_EXPIRES_IN: string;
  public readonly DB_URL: string;
  public readonly REDIS_CACHE_URL: string;
  public readonly CACHE_TTL: string;

  constructor() {
    dotenv.config();
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
    this.JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN;
    this.DB_URL = process.env.DB_URL;
    this.REDIS_CACHE_URL = process.env.REDIS_CACHE_URL;
    this.CACHE_TTL = process.env.CACHE_TTL;
  }
}

export default ConfigService;
