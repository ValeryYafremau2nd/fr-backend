import * as mongoose from 'mongoose';
import { inject, injectable } from 'inversify';
import { TYPES } from '../containers/types';
import ConfigService from '../config/config-service';
import CachingService from './caching-service';
import NotificationService from '../services/notification-service';

@injectable()
class DBConnection {
  private _connection: Promise<typeof mongoose>;
  constructor(
    @inject(TYPES.ConfigService) private readonly _configService: ConfigService,
    @inject(TYPES.CachingService)
    private readonly _cachingService: CachingService,
    @inject(TYPES.NotificationService)
    private readonly _notificationService: NotificationService
  ) {
    this._connection = mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('db connected')
  }

  public get connection() {
    return this._connection;
  }
}

export default DBConnection;
