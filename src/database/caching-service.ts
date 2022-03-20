import * as mongoose from 'mongoose';
import { inject, injectable } from 'inversify';
import { TYPES } from '../containers/types';
import ConfigService from '../config/config-service';
import * as redis from 'redis';

@injectable()
class CachingService {
  constructor(
    @inject(TYPES.ConfigService) private readonly _configService: ConfigService
  ) {
    const client = redis.createClient({ url: _configService.REDIS_CACHE_URL });
    client.connect();
    const exec = mongoose.Query.prototype.exec;

    mongoose.Query.prototype.exec = async function () {
      if (this.mongooseCollection.name !== 'teams')
        return exec.apply(this, arguments);
      const key = JSON.stringify({
        ...this.getQuery(),
        collection: this.mongooseCollection.name,
        op: this.op,
        options: this.options
      });

      const cacheValue = await client.get(key);
      if (cacheValue) return JSON.parse(cacheValue);

      const result = await exec.apply(this, arguments);

      if (result) {
        client.set(key, JSON.stringify(result), {
          EX: 1000 // const
        });
      }

      return result;
    };
  }
}

export default CachingService;
