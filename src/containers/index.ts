import { Container } from 'inversify';
import { TYPES } from './types';
import ProtectMiddleware from '../auth/middlewares/protect-middleware';
import UserService from '../auth/services/user-service';
import CompetitionService from '../services/competition-service';
import FavoritesService from '../services/favorites-service';
import DBConnection from '../database/db-connection';
import ConfigService from '../config/config-service';
import CachingService from '../database/caching-service';
import NotificationService from '../services/notification-service';

const mainContainer = new Container();

mainContainer.bind<UserService>(TYPES.UserService).to(UserService);

mainContainer
  .bind<CompetitionService>(TYPES.CompetitionService)
  .to(CompetitionService);

mainContainer
  .bind<FavoritesService>(TYPES.FavoritesService)
  .to(FavoritesService);

mainContainer.bind<ConfigService>(TYPES.ConfigService).to(ConfigService);

mainContainer.bind<CachingService>(TYPES.CachingService).to(CachingService);

mainContainer.bind<DBConnection>(TYPES.DBConnection).to(DBConnection);

mainContainer
  .bind<ProtectMiddleware>(TYPES.ProtectMiddleware)
  .to(ProtectMiddleware);

mainContainer
  .bind<NotificationService>(TYPES.NotificationService)
  .to(NotificationService);

export default mainContainer;
